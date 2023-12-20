import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { checkStripeData } from "../../../lib/stripe-utils";
import Stripe from "stripe";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { TierPaths } from "@stripe-discord/db-lib";

const discordRest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);

    const guildId = searchParams.get("guildId");
    const tierId = searchParams.get("tierId");
    const priceId = searchParams.get("priceId");

    if (!guildId || typeof guildId !== "string") {
      throw new Error("No server id");
    }

    if (!tierId || typeof tierId !== "string") {
      throw new Error("No tier id");
    }

    if (!priceId || typeof priceId !== "string") {
      throw new Error("No price id");
    }

    const session = await auth();

    if (!session) {
      throw new Error("The user is not authenticated.");
    }

    const { owner_id } = (await discordRest.get(Routes.guild(guildId))) as {
      owner_id: string;
    };

    const tierData = await TierPaths.tier(tierId).get();

    const tier = tierData.data();

    if (!tier) {
      throw new Error("Tier not found");
    }

    const { id, accessToken, name, email } = session.user;

    if (owner_id === id) {
      throw new Error("You can't subscribe to your own server");
    }

    if (!name || !email) {
      throw new Error("Missing user information");
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
        throw new Error("Customer already has a subscription");
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
      throw new Error("No session found");
    }

    // Return the URL for client-side redirection
    return NextResponse.json({
      url: checkoutSession.url,
    });
  } catch (error) {
    console.error("Error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new NextResponse(JSON.stringify(error), {
      status: 500,
      statusText: errorMessage,
    });
  }
}
