import { firestore } from "firebase-admin";
import { CustomerPaths } from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { Customer } from "@stripe-discord/types";

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
    ]);

    // Buffer the request data
    const sig = headers.get("stripe-signature");

    if (!sig) {
      return NextResponse.json(
        {
          error: "No signature found",
        },
        {
          status: 400,
        }
      );
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

const handleSubscriptionEvent = async (event: Stripe.Event) => {
  const { type } = event;

  try {
    switch (type) {
      case "customer.subscription.updated":
        await handleSubscriptionUpdate(event);
        break;
      case "customer.subscription.deleted":
        await handleDeleteSubscription(event);
        break;
      case "checkout.session.completed":
        await handleCheckoutSessionComplete(event);
        break;
      default:
        console.warn(`Unhandled relevant event type: ${type}`);
        return;
    }
  } catch (error: any) {
    console.error("Error handling subscription event:", error.message);
    throw error;
  }
};

const handleCheckoutSessionComplete = async (event: Stripe.Event) => {
  try {
    // Extract data from the incoming event
    const session = event.data.object as Stripe.Checkout.Session;
    const stripeSubscriptionId = session.subscription as string;
    const stripeCustomerId = session.customer as string;
    const metadata = session.metadata;

    if (!metadata) {
      throw new Error("Metadata not found.");
    }

    // Get the Discord user ID from session metadata
    const { discordId } = metadata;

    if (!discordId) {
      throw new Error("Discord ID not found.");
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

    const customerRef = CustomerPaths.customerByUserId(discordId);

    await customerRef.set(customerData, { merge: true });
  } catch (error) {
    console.error("Error processing checkout session:", error);
    throw error;
  }
};

const handleSubscriptionUpdate = async (event: Stripe.Event) => {
  try {
    // Extract relevant data from the incoming event
    const subscription = event.data.object as Stripe.Subscription;

    if (subscription.status === "canceled") {
      await handleDeleteSubscription(event);
      return;
    }

    const subscriptionId = subscription.id;

    const customerRef = CustomerPaths.customerBySubscriptionId(subscriptionId);

    const customerSnapshot = await customerRef.get();

    if (customerSnapshot.empty) {
      throw new Error("Customer not found.");
    }

    const customerDocument = customerSnapshot.docs[0];

    const partialCustomerData: Partial<Customer> = {
      stripeSubscriptionStatus: subscription.status,
      stripeSubscriptionPriceId: subscription.items.data[0].price.id,
      stripeSubscriptionItemId: subscription.items.data[0].id,
    };

    await customerDocument.ref.update(partialCustomerData);
  } catch (error: any) {
    console.error("Error deleting subscription:", error.message);
    throw error;
  }
};

const handleDeleteSubscription = async (event: Stripe.Event) => {
  try {
    // Extract relevant data from the incoming event
    const subscription = event.data.object as Stripe.Subscription;
    const subscriptionId = subscription.id;

    const customerRef = CustomerPaths.customerBySubscriptionId(subscriptionId);

    const customerSnapshot = await customerRef.get();

    if (customerSnapshot.empty) {
      throw new Error("Customer not found.");
    }

    const customerDocument = customerSnapshot.docs[0];

    const partialCustomerData: Partial<Customer> = {
      stripeSubscriptionId: "",
      stripeSubscriptionStatus: "",
      stripeSubscriptionPriceId: "",
      stripeSubscriptionItemId: "",
      stripeCustomerId: "",
    };

    await customerDocument.ref.update(partialCustomerData);
  } catch (error: any) {
    console.error("Error deleting subscription:", error.message);
    throw error;
  }
};
