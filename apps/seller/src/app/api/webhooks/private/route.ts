import { firestore } from "firebase-admin";
import { CustomerPaths } from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { ApiError, Customer } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

// Initialize the Stripe instance with your secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: "2023-10-16",
});

const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

export async function POST(req: NextRequest) {
  try {
    const { headers } = req;

    const relevantEvents = new Set([
      "customer.subscription.updated",
      "customer.subscription.deleted",
      "checkout.session.completed",
      "customer.deleted",
    ]);

    // Buffer the request data
    const sig = headers.get("stripe-signature");

    if (!sig) {
      throw new ApiError("No signature found", 400);
    }

    const rawBody = await req.text();

    // Construct the event using Stripe's webhook secret
    const event = stripe.webhooks.constructEvent(
      rawBody,
      sig,
      stripeWebhookSecret
    );

    if (relevantEvents.has(event.type)) {
      // Handle relevant subscription events
      await handleSubscriptionEvent(event);
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
    return handleApiError(error);
  }
}

const handleSubscriptionEvent = async (event: Stripe.Event) => {
  const { type } = event;

  switch (type) {
    case "customer.subscription.updated":
    case "customer.subscription.deleted":
      await handleSubscriptionUpdate(event);
      break;
    case "checkout.session.completed":
      await handleCheckoutSessionComplete(event);
      break;
    case "customer.deleted":
      await handleDeletedCustomer(event);
      break;
    default:
      console.warn(`Unhandled relevant event type: ${type}`);
      return;
  }
};

const handleCheckoutSessionComplete = async (event: Stripe.Event) => {
  // Extract data from the incoming event
  const session = event.data.object as Stripe.Checkout.Session;
  const stripeSubscriptionId = session.subscription as string;
  const stripeCustomerId = session.customer as string;
  const metadata = session.metadata;

  if (!metadata) {
    throw new ApiError("Metadata not found.", 400);
  }

  // Get the Discord user ID from session metadata
  const { discordId } = metadata;

  if (!discordId) {
    throw new ApiError("Discord ID not found.", 400);
  }

  const subscription = await stripe.subscriptions.retrieve(
    stripeSubscriptionId
  );

  const stripeSubscriptionStatus = subscription.status;
  const stripeSubscriptionPriceId = subscription.items.data[0].price.id;
  const stripeSubscriptionItemId = subscription.items.data[0].id;

  const customerData: firestore.PartialWithFieldValue<Customer> = {
    userId: discordId,
    stripeCustomerId,
    stripeSubscriptionId,
    stripeSubscriptionStatus,
    stripeSubscriptionPriceId,
    stripeSubscriptionItemId,
  };

  await CustomerPaths.customerByUserId(discordId).set(customerData, {
    merge: true,
  });
};

const handleSubscriptionUpdate = async (event: Stripe.Event) => {
  // Extract relevant data from the incoming event
  const subscription = event.data.object as Stripe.Subscription;
  const subscriptionId = subscription.id;
  const stripeSubscriptionStatus = subscription.status;
  const stripeSubscriptionPriceId = subscription.items.data[0].price.id;
  const stripeSubscriptionItemId = subscription.items.data[0].id;

  const customerSnapshot = await CustomerPaths.customerBySubscriptionId(
    subscriptionId
  ).get();

  if (customerSnapshot.empty) {
    throw new ApiError("Customer not found.", 404);
  }

  const partialCustomerData: Partial<Customer> = {
    stripeSubscriptionStatus,
    stripeSubscriptionPriceId,
    stripeSubscriptionItemId,
  };

  await customerSnapshot.docs[0].ref.update(partialCustomerData);
};

const handleDeletedCustomer = async (event: Stripe.Event) => {
  // Extract relevant data from the incoming event
  const customer = event.data.object as
    | Stripe.Customer
    | Stripe.DeletedCustomer;
  const customerId = customer.id;

  const customerSnapshot = await CustomerPaths.customerByCustomerId(
    customerId
  ).get();

  if (customerSnapshot.empty) {
    throw new ApiError("Customer not found.", 404);
  }

  const partialCustomerData: Partial<Customer> = {
    stripeCustomerId: "",
    stripeSubscriptionId: "",
    stripeSubscriptionItemId: "",
    stripeSubscriptionPriceId: "",
    stripeSubscriptionStatus: "",
  };

  await customerSnapshot.docs[0].ref.update(partialCustomerData);
};
