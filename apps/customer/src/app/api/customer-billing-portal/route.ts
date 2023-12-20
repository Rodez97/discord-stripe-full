import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { checkStripeData } from "../../../lib/stripe-utils";
import Stripe from "stripe";
import { UserSubscriptions } from "@stripe-discord/db-lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId || typeof guildId !== "string") {
      throw new Error("No server id");
    }

    const session = await auth();

    if (!session) {
      throw new Error("The user is not authenticated.");
    }

    const { id } = session.user;

    const userSubscriptionRef = UserSubscriptions.userSubscriptionByServerId(
      id,
      guildId
    );

    const userSubscriptionSnapshot = await userSubscriptionRef.get();

    if (userSubscriptionSnapshot.empty) {
      throw new Error("We couldn't find your server");
    }

    const userSubscription = userSubscriptionSnapshot.docs[0].data();

    const { customerId, sellerId } = userSubscription;

    // Get Stripe secret key from integration settings
    const integrationSettings = await checkStripeData(sellerId);
    const { stripeSecretKey } = integrationSettings;

    // Initialize Stripe with the secret key
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    // Create a Billing Portal Session for subscription management
    const billingSession = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: process.env.NEXT_PUBLIC_MAIN_URL,
    });

    // Return the URL for client-side redirection
    return NextResponse.json({
      url: billingSession.url,
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
