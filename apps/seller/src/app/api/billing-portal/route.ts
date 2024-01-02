import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "../../../../auth";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

// Initialize the Stripe instance with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function GET() {
  try {
    // Authenticate the user
    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    // Check if a customer with the same email already exists
    const existingCustomer = await stripe.customers.list({
      email: session.user.email,
      limit: 1,
    });

    const customerAlreadyExists = existingCustomer.data.length > 0;

    if (!customerAlreadyExists) {
      throw new ApiError("Customer not found in Stripe.", 400);
    }

    const customer = existingCustomer.data[0];

    // Create a Billing Portal Session for subscription management
    const billingPortalSession = await stripe.billingPortal.sessions.create({
      customer: customer.id,
      return_url: process.env.NEXT_PUBLIC_MAIN_URL,
    });

    // Return the URL for client-side redirection
    return NextResponse.redirect(billingPortalSession.url);
  } catch (error) {
    return handleApiError(error);
  }
}
