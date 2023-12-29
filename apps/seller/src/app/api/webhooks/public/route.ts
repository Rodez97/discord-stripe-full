import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkStripeData } from "../../../../lib/stripe-utils";
import { TierPaths, UserSubscriptions } from "@stripe-discord/db-lib";
import { REST } from "@discordjs/rest";
import { ApiError, UserSubscription } from "@stripe-discord/types";
import { APIPartialGuild, Routes } from "discord-api-types/v10";
import { handleApiError } from "@stripe-discord/lib";

const DiscordRest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

export async function POST(req: NextRequest) {
  try {
    const sellerId = req.nextUrl.searchParams.get("sellerId");
    const { headers } = req;

    if (!sellerId) {
      throw new ApiError("Seller ID is missing or invalid", 400);
    }

    const relevantEvents = new Set([
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "checkout.session.completed",
    ]);

    // Buffer the request data
    const sig = headers.get("stripe-signature");

    if (!sig) {
      throw new ApiError("No signature found", 400);
    }

    const integrationSettings = await checkStripeData(sellerId);

    const { stripeWebhookSecret, stripeSecretKey } = integrationSettings;

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    const rawBody = await req.text();

    // Construct the event using Stripe's webhook secret
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      stripeWebhookSecret
    );

    if (relevantEvents.has(event.type)) {
      // Handle relevant subscription events
      await handleSubscriptionEvent(event, sellerId, stripe);
    }

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        received: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

const handleSubscriptionEvent = async (
  event: Stripe.Event,
  sellerDiscordId: string,
  stripe: Stripe
) => {
  const { data, type } = event;

  switch (type) {
    case "customer.subscription.updated":
      {
        const subscription = data.object as Stripe.Subscription;
        if (subscription.status === "canceled") {
          await handleDeleteSubscription(event);
        } else {
          await handleUpdateSubscription(event);
        }
      }
      break;
    case "customer.subscription.deleted":
      await handleDeleteSubscription(event);
      break;
    case "checkout.session.completed":
      await handleCheckoutSessionComplete(event, sellerDiscordId, stripe);
      break;
    default:
      console.warn(`Unhandled relevant event type: ${type}`);
      return;
  }
};

const handleCheckoutSessionComplete = async (
  event: Stripe.Event,
  sellerDiscordId: string,
  stripe: Stripe
) => {
  // Extract data from the incoming event
  const session = event.data.object as Stripe.Checkout.Session;
  const subscriptionId = session.subscription as string;
  const customerId = session.customer as string;
  const metadata = session.metadata;

  if (!metadata) {
    throw new ApiError("Metadata not found.", 400);
  }

  const { tierId, guildId, accessToken, customerDiscordId } = metadata;

  // Validate required metadata
  if (!tierId || !guildId || !accessToken || !customerDiscordId) {
    throw new ApiError("Invalid metadata.", 400);
  }

  // Retrieve subscription information from Stripe
  const subscription = await stripe.subscriptions.retrieve(subscriptionId);

  // Retrieve tier information from the database
  const tierSnapshot = await TierPaths.tier(tierId).get();
  const tier = tierSnapshot.data();

  if (!tier) {
    throw new ApiError("Tier not found.", 400);
  }

  const { discordRoles } = tier;

  // Update Discord roles for the guild member
  await DiscordRest.put(Routes.guildMember(guildId, customerDiscordId), {
    body: {
      access_token: accessToken,
      roles: discordRoles,
    },
  });

  // Retrieve guild information from Discord API
  const guildData = (await DiscordRest.get(
    Routes.guild(guildId)
  )) as APIPartialGuild;

  // Store subscription information in the database
  await UserSubscriptions.userSubscriptionBySubId(subscriptionId).set({
    userId: customerDiscordId,
    subscriptionId,
    subscriptionStatus: subscription.status,
    customerId,
    guildId,
    sellerId: sellerDiscordId,
    guildName: guildData.name,
    guildIcon: guildData.icon || "",
    tierId,
    roles: discordRoles,
  });
};

const handleDeleteSubscription = async (event: Stripe.Event) => {
  // Extract relevant data from the incoming event
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;

  // Retrieve subscription information from the database
  const subscriptionSnapshot = await UserSubscriptions.userSubscriptionBySubId(
    subscriptionId
  ).get();

  const subscriptionData = subscriptionSnapshot.data();

  if (!subscriptionData) {
    throw new ApiError("Subscription not found.", 400);
  }

  const { guildId, userId } = subscriptionData;

  // Delete the subscription reference from Firestore
  await subscriptionSnapshot.ref.delete();

  // Check if the user is still in the guild
  const member = await DiscordRest.get(Routes.guildMember(guildId, userId));

  if (member) {
    // If so, remove the roles
    await DiscordRest.patch(Routes.guildMember(guildId, userId), {
      body: {
        roles: [],
      },
    });
  }
};

const handleUpdateSubscription = async (event: Stripe.Event) => {
  // Extract relevant data from the incoming event
  const { object, previous_attributes } = event.data;
  const currentSubscription = object as Stripe.Subscription;
  const status = currentSubscription.status;
  const oldSubscription = previous_attributes as Partial<Stripe.Subscription>;
  const subscriptionId = currentSubscription.id;

  // Get IDs of current and previous products
  const productId = currentSubscription.items?.data?.[0]?.price?.product;
  const oldProductId = oldSubscription.items?.data?.[0]?.price?.product;

  // Retrieve subscription information from the database
  const subscriptionSnapshot = await UserSubscriptions.userSubscriptionBySubId(
    subscriptionId
  ).get();

  const subscriptionData = subscriptionSnapshot.data();

  if (!subscriptionData) {
    throw new ApiError("Subscription not found.", 400);
  }

  const subscriptionDocumentUpdate: Partial<UserSubscription> = {};

  const { guildId, userId, sellerId, subscriptionStatus } = subscriptionData;

  // Check if the subscription status has changed
  if (subscriptionStatus !== status) {
    subscriptionDocumentUpdate.subscriptionStatus = status;
  }

  // Compare products to determine if there's a change
  if (oldProductId) {
    const tierForProduct = await TierPaths.tiersByProductId(
      productId as string,
      sellerId
    ).get();

    if (tierForProduct.empty) {
      throw new ApiError("There is no tier with the new product ID.", 400);
    }

    const newTier = tierForProduct.docs[0].data();

    if (guildId !== newTier.guildId) {
      throw new ApiError(
        "Changing the guild of a subscription is not supported.",
        400
      );
    }

    subscriptionDocumentUpdate.roles = newTier.discordRoles;

    // Check if the user is still in the guild
    try {
      const member = await DiscordRest.get(Routes.guildMember(guildId, userId));
      if (member) {
        await DiscordRest.patch(Routes.guildMember(guildId, userId), {
          body: {
            roles: newTier.discordRoles,
          },
        });
      }
    } catch (error) {
      console.error("Error updating user's roles:", error);
    }
  }

  // Update the subscription reference in Firestore if necessary
  if (Object.keys(subscriptionDocumentUpdate).length > 0) {
    await subscriptionSnapshot.ref.set(subscriptionDocumentUpdate, {
      merge: true,
    });
  }
};
