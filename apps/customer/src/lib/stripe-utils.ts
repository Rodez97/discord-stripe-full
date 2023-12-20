import { CustomerPaths } from "@stripe-discord/db-lib";

export const checkStripeData = async (userId: string) => {
  const customerRef = CustomerPaths.customerByUserId(userId);
  const integrationSettings = (await customerRef.get()).data();

  if (!integrationSettings) {
    throw new Error("No settings found, please, set them up");
  }

  const { stripeWebhookSecret, stripeSecretKey, stripeSubscriptionStatus } =
    integrationSettings;

  if (!stripeWebhookSecret) {
    throw new Error(
      "No webhook secret found in your settings, please, make sure to set up the required keys"
    );
  }

  if (!stripeSecretKey) {
    throw new Error(
      "No stripe secret key found, please, make sure to set up the required keys"
    );
  }

  if (
    stripeSubscriptionStatus !== "active" &&
    stripeSubscriptionStatus !== "trialing"
  ) {
    throw new Error(
      "There is a problem with your subscription, verify that it is active to use this feature"
    );
  }

  return {
    stripeWebhookSecret,
    stripeSecretKey,
  };
};
