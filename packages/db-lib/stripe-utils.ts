import { ApiError } from "@stripe-discord/types";
import { CustomerPaths } from "./firestore-db-paths";

export const checkStripeData = async (userId: string) => {
  const customerRef = CustomerPaths.customerByUserId(userId);
  const integrationSettings = (await customerRef.get()).data();

  if (!integrationSettings) {
    throw new ApiError("No settings found, please, set them up", 400);
  }

  const { stripeWebhookSecret, stripeSecretKey, stripeSubscriptionStatus } =
    integrationSettings;

  if (!stripeWebhookSecret) {
    throw new ApiError(
      "No webhook secret found in your settings, please, make sure to set up the required keys.",
      400
    );
  }

  if (!stripeSecretKey) {
    throw new ApiError(
      "No stripe secret key found, please, make sure to set up the required keys.",
      400
    );
  }

  if (
    stripeSubscriptionStatus !== "active" &&
    stripeSubscriptionStatus !== "trialing"
  ) {
    throw new ApiError(
      "There is a problem with your subscription, verify that it is active to use this feature.",
      400
    );
  }

  return {
    stripeWebhookSecret,
    stripeSecretKey,
  };
};
