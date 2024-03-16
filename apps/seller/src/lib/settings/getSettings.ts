"use server";

import { cache } from "react";
import { auth } from "../../../auth";
import { CustomerPaths } from "@stripe-discord/db-lib";

export const getSettings = cache(async () => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  const customerSnapshot = await CustomerPaths.customerByUserId(user.id).get();

  if (!customerSnapshot.exists) {
    throw new Error("The customer does not exist.");
  }

  const customer = customerSnapshot.data();

  if (!customer) {
    throw new Error("The customer does not exist.");
  }

  const settings = {
    stripePublishableKey: customer.stripePublishableKey ?? "",
    stripeSecretKey: customer.stripeSecretKey ?? "",
    stripeWebhookSecret: customer.stripeWebhookSecret ?? "",
  };

  return settings;
});
