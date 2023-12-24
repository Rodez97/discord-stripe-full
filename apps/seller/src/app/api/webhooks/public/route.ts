import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { checkStripeData } from "../../../../lib/stripe-utils";
import { TierPaths, UserSubscriptions } from "@stripe-discord/db-lib";
import { REST } from "@discordjs/rest";
import { UserSubscription } from "@stripe-discord/types";
import { Routes } from "discord-api-types/v10";

const DiscordRest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

export async function POST(req: NextRequest) {
  try {
    const sellerId = req.nextUrl.searchParams.get("sellerId");
    const { headers } = req;

    if (!sellerId) {
      return NextResponse.json(
        {
          error: "Seller ID is missing or invalid",
        },
        {
          status: 400,
        }
      );
    }

    const relevantEvents = new Set([
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "checkout.session.completed",
    ]);

    // Buffer the request data
    const sig = headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        {
          error: "No signature found",
        },
        {
          status: 400,
        }
      );
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
    console.error("Error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}

const handleSubscriptionEvent = async (
  event: Stripe.Event,
  sellerDiscordId: string,
  stripe: Stripe
) => {
  const { data, type } = event;

  try {
    switch (type) {
      case "customer.subscription.updated":
        {
          const subscription = data.object as Stripe.Subscription;
          if (subscription.status === "canceled") {
            await handleDeleteSubscription(event);
          } else {
            await handleChangedProduct(event);
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
  } catch (error: any) {
    console.error("Error handling subscription event:", error.message);
    throw error;
  }
};

const handleCheckoutSessionComplete = async (
  event: Stripe.Event,
  sellerDiscordId: string,
  stripe: Stripe
) => {
  try {
    // Extract data from the incoming event
    const session = event.data.object as Stripe.Checkout.Session;
    const subscriptionId = session.subscription as string;
    const customerId = session.customer as string;
    const metadata = session.metadata;

    if (!metadata) {
      throw new Error("Metadata not found.");
    }

    const { tierId, guildId, accessToken, customerDiscordId } = metadata;

    if (!tierId) {
      throw new Error("Tier ID not found.");
    }

    if (!guildId) {
      throw new Error("Guild ID not found.");
    }

    if (!accessToken) {
      throw new Error("Access token not found.");
    }

    if (!customerDiscordId) {
      throw new Error("Customer Discord ID not found.");
    }

    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    const tierRef = TierPaths.tier(tierId);

    const tier = (await tierRef.get()).data();

    if (!tier) {
      throw new Error("Tier not found.");
    }

    const { discordRoles } = tier;

    await DiscordRest.put(Routes.guildMember(guildId, customerDiscordId), {
      body: {
        access_token: accessToken,
        roles: discordRoles,
      },
    });

    const guildData = (await DiscordRest.get(Routes.guild(guildId))) as any;

    // Store subscription details in Firestore
    const subscriptionRef =
      UserSubscriptions.userSubscriptionBySubId(subscriptionId);

    await subscriptionRef.set({
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
  } catch (error) {
    console.error("Error processing checkout session:", error);
    throw error;
  }
};

const handleDeleteSubscription = async (event: Stripe.Event) => {
  try {
    // Extract relevant data from the incoming event
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;

    const subscriptionRef =
      UserSubscriptions.userSubscriptionBySubId(subscriptionId);

    const subscriptionData = (await subscriptionRef.get()).data();

    if (!subscriptionData) {
      throw new Error("Subscription not found.");
    }

    const { guildId, userId } = subscriptionData;

    // Delete the subscription reference from Firestore
    await subscriptionRef.delete();

    await DiscordRest.patch(Routes.guildMember(guildId, userId), {
      body: {
        roles: [],
      },
    });
  } catch (error: any) {
    console.error("Error deleting subscription:", error.message);
    throw error;
  }
};

const handleChangedProduct = async (event: Stripe.Event) => {
  try {
    // Extract relevant data from the incoming event
    const { object, previous_attributes } = event.data;
    const currentSubscription = object as Stripe.Subscription;
    const oldSubscription = previous_attributes as Partial<Stripe.Subscription>;
    const subscriptionId = currentSubscription.id;

    // Get IDs of current and previous products
    const currentProductId = currentSubscription.items?.data?.[0]?.price
      ?.product as string | undefined;
    const oldProductId = oldSubscription.items?.data?.[0]?.price?.product as
      | string
      | undefined;

    const subscriptionRef =
      UserSubscriptions.userSubscriptionBySubId(subscriptionId);

    const subscriptionData = (await subscriptionRef.get()).data();

    if (!subscriptionData) {
      throw new Error("Subscription not found.");
    }

    const { guildId, userId, sellerId } = subscriptionData;

    // Compare products to determine if there's a change
    if (oldProductId && currentProductId && oldProductId !== currentProductId) {
      const tierRef = TierPaths.tiersByProductId(currentProductId, sellerId);

      const tierData = await tierRef.get();

      if (tierData.empty) {
        throw new Error("There is no tier with the new product ID.");
      }

      const tier = tierData.docs[0].data();
      const { discordRoles: newRoles, guildId: newGuildId } = tier;

      if (guildId !== newGuildId) {
        throw new Error(
          "Changing the guild of a subscription is not supported."
        );
      }

      const subscriptionDocumentUpdate: Partial<UserSubscription> = {
        roles: newRoles,
      };

      await subscriptionRef.set(subscriptionDocumentUpdate, { merge: true });

      await DiscordRest.patch(Routes.guildMember(guildId, userId), {
        body: {
          roles: newRoles,
        },
      });
    }
  } catch (error) {
    console.error("Error handling changed product:", error);
    throw error;
  }
};
