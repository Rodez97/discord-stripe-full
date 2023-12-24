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
      return NextResponse.json({ error: "No server id" }, { status: 400 });
    }

    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const { id } = session.user;

    const userSubscriptionRef = UserSubscriptions.userSubscriptionByServerId(
      id,
      guildId
    );

    const userSubscriptionSnapshot = await userSubscriptionRef.get();

    if (userSubscriptionSnapshot.empty) {
      return NextResponse.json({ error: "No subscription" }, { status: 400 });
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
    return NextResponse.json(
      {
        url: billingSession.url,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error:", error);
    return new NextResponse(JSON.stringify(error), {
      status: 500,
    });
  }
}
