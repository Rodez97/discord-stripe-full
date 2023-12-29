import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import Stripe from "stripe";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { TierPaths, checkStripeData } from "@stripe-discord/db-lib";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

const discordRest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const guildId = searchParams.get("guildId");
    const tierId = searchParams.get("tierId");
    const priceId = searchParams.get("priceId");

    if (!guildId) {
      throw new ApiError("No server id", 400);
    }

    if (!tierId) {
      throw new ApiError("No tier id", 400);
    }

    if (!priceId) {
      throw new ApiError("No price id", 400);
    }

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const { owner_id } = (await discordRest.get(Routes.guild(guildId))) as {
      owner_id: string;
    };

    const tierData = await TierPaths.tier(tierId).get();

    const tier = tierData.data();

    if (!tier) {
      throw new ApiError("Tier not found", 404);
    }

    const { id, accessToken, name, email } = session.user;

    if (owner_id === id) {
      throw new ApiError("You can't subscribe to your own server", 400);
    }

    if (!name || !email) {
      throw new ApiError("Missing user information", 400);
    }

    const integrationSettings = await checkStripeData(owner_id);

    const { stripeSecretKey } = integrationSettings;

    // Initialize the Stripe instance with your secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Check if a customer with the same email already exists
    const existingCustomer = await stripe.customers.list({
      email,
      limit: 1,
    });

    const customerAlreadyExists = existingCustomer.data.length > 0;
    let customer: Stripe.Customer | null = null;

    const metadata = {
      customerDiscordId: id,
      serverOwnerId: owner_id,
      guildId,
      tierId,
      accessToken,
    };

    if (customerAlreadyExists) {
      // Customer already exists
      customer = existingCustomer.data[0];

      // Check if there's an existing subscription for the customer
      const existingSubscription = await stripe.subscriptions.list({
        customer: customer.id,
        limit: 1,
      });

      if (existingSubscription.data.length > 0) {
        throw new ApiError("You are already subscribed to this server", 400);
      }
    } else {
      // Create a new customer if none exists
      customer = await stripe.customers.create({
        email,
        name,
        metadata,
      });
    }

    // Create a Checkout Session for subscription
    const checkoutSession = await stripe.checkout.sessions.create({
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "subscription",
      success_url:
        process.env.NEXT_PUBLIC_MAIN_URL + `/subscribe-success?success=true`,
      cancel_url:
        process.env.NEXT_PUBLIC_MAIN_URL + `/subscribe-success?success=false`,
      customer: customer.id,
      subscription_data: {
        metadata,
      },
      metadata,
    });

    if (!checkoutSession || !checkoutSession.url) {
      throw new ApiError("No session found", 500);
    }

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        url: checkoutSession.url,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
