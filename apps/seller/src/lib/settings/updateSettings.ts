"use server";

import { auth } from "../../../auth";
import { CustomerPaths } from "@stripe-discord/db-lib";
import { StripeKeys } from "@stripe-discord/types";
import { revalidatePath } from "next/cache";
import Stripe from "stripe";

const enabled_events: Stripe.WebhookEndpointUpdateParams.EnabledEvent[] = [
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "checkout.session.completed",
];

export const updateSettings = async (keys: StripeKeys) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  // Create or update the webhook URL in Stripe
  const webhookUrl = `${process.env.NEXTAUTH_URL}/api/webhooks/${user.id}`;
  const stripe = new Stripe(keys.stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  const currentWebhooks = await stripe.webhookEndpoints.list();

  // Check if there is a webhook with the same URL
  const currentWebhook = currentWebhooks.data.find(
    (webhook) => webhook.url === webhookUrl
  );

  let webhook: Stripe.WebhookEndpoint;
  let stripeWebhookSecret: string | undefined;

  if (currentWebhook) {
    webhook = await stripe.webhookEndpoints.update(currentWebhook.id, {
      enabled_events,
    });
    if (!keys.stripeWebhookSecret) {
      throw new Error(
        "The webhook secret is missing. Please, delete the webhook on Stripe and try again."
      );
    }
  } else {
    webhook = await stripe.webhookEndpoints.create({
      url: webhookUrl,
      enabled_events,
    });
    stripeWebhookSecret = webhook.secret;
  }

  // Save the webhook secret
  await CustomerPaths.customerByUserId(user.id).set(
    stripeWebhookSecret ? { ...keys, stripeWebhookSecret } : keys,
    {
      merge: true,
    }
  );

  revalidatePath("/settings");
};
