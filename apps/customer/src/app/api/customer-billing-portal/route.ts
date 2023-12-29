import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import Stripe from "stripe";
import { UserSubscriptions, checkStripeData } from "@stripe-discord/db-lib";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      throw new ApiError("No server id", 400);
    }

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const { id } = session.user;

    const userSubscriptionRef = UserSubscriptions.userSubscriptionByServerId(
      id,
      guildId
    );

    const userSubscriptionSnapshot = await userSubscriptionRef.get();

    if (userSubscriptionSnapshot.empty) {
      throw new ApiError(
        "We couldn't find your subscription for this server.",
        404
      );
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
    return handleApiError(error);
  }
}
