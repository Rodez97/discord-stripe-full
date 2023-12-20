import { NextResponse } from "next/server";
import Stripe from "stripe";
import { auth } from "../../../../auth";

// Initialize the Stripe instance with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const user = session.user;

    const email = user.email;

    if (!email) {
      return NextResponse.json({ error: "No email" }, { status: 400 });
    }

    // Check if a customer with the same email already exists
    const existingCustomer = await stripe.customers.list({
      email,
      limit: 1,
    });

    const customerAlreadyExists = existingCustomer.data.length > 0;

    if (!customerAlreadyExists) {
      return NextResponse.json({ error: "No customer" }, { status: 400 });
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
    return new NextResponse(JSON.stringify(error), {
      status: 500,
      statusText: errorMessage,
    });
  }
}
