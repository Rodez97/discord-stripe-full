"use server";
import Stripe from "stripe";
import { redirect } from "next/navigation";
import { auth } from "../../auth";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function createBillingPortalSession() {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  const isSubscribed = user.subscription;

  if (!isSubscribed) {
    throw new Error("The user is not subscribed");
  }

  const email = user.email;

  if (!email) {
    throw new Error("No email");
  }

  // Check if a customer with the same email already exists
  const existingCustomer = await stripe.customers.list({
    email,
    limit: 1,
  });

  const customerAlreadyExists = existingCustomer.data.length > 0;

  if (!customerAlreadyExists) {
    throw new Error("Customer not found");
  }

  const customer = existingCustomer.data[0];

  // Create a Billing Portal Session for subscription management
  const billingPortalSession = await stripe.billingPortal.sessions.create({
    customer: customer.id,
    return_url: process.env.NEXT_PUBLIC_MAIN_URL,
  });

  // Return the URL for client-side redirection
  redirect(billingPortalSession.url);
}

export async function createCheckoutSession() {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  const email = user.email;

  if (!email) {
    throw new Error("No email");
  }

  const priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ID!;

  // Get the user's Discord username, email, and ID
  const { id, name } = user;

  const metadata: Stripe.MetadataParam = {
    discordId: id,
    discordUsername: name || "Unknown",
  };

  const requestOptions: Stripe.Checkout.SessionCreateParams = {
    ui_mode: "embedded",
    line_items: [
      {
        price: priceId,
        quantity: 1,
      },
    ],
    mode: "subscription",
    return_url: `${process.env.NEXT_PUBLIC_MAIN_URL}/subscribe-success?session_id={CHECKOUT_SESSION_ID}`,
    customer_email: email,
    metadata,
    subscription_data: {
      trial_settings: {
        end_behavior: {
          missing_payment_method: "cancel",
        },
      },
      trial_period_days: 30,
      metadata,
    },
    payment_method_collection: "if_required",
  };

  // Create a Checkout Session for subscription
  const checkoutSession = await stripe.checkout.sessions.create(requestOptions);

  return checkoutSession.client_secret;
}
