import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "../../../../auth";

// Initialize the Stripe instance with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

/**
 * Handles GET request for billing portal session creation.
 * @returns {Promise<NextResponse>} The Next.js response.
 */
export async function GET() {
  try {
    // Authenticate the user
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "User authentication failed." },
        { status: 401 }
      );
    }

    const user = session.user;
    const userEmail = user.email;

    if (!userEmail) {
      return NextResponse.json(
        { error: "No email found for the user." },
        { status: 400 }
      );
    }

    // Check if a customer with the same email already exists
    const existingCustomer = await stripe.customers.list({
      email: userEmail,
      limit: 1,
    });

    const customerAlreadyExists = existingCustomer.data.length > 0;

    if (!customerAlreadyExists) {
      return NextResponse.json(
        { error: "Customer not found." },
        { status: 400 }
      );
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
