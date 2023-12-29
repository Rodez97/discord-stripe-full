import type Stripe from "stripe";
export type Customer = {
  userId: string;
  stripeCustomerId: string;
  stripeSubscriptionId: string;
  stripeSubscriptionItemId: string;
  stripeSubscriptionStatus: string;
  stripeSubscriptionPriceId: string;
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
};

export type DiscordTier = {
  id: string;
  nickname: string;
  description?: string;
  benefits?: string[];
  productId: string;
  monthlyPriceId: string;
  yearlyPriceId?: string;
  discordRoles: string[];
  sellerId: string;
  guildId: string;
};

export type DiscordTierWithPrices = DiscordTier & {
  monthlyPriceQty: number;
  yearlyPriceQty?: number;
  currency: string;
};

export type MonetizedServer = {
  id: string;
  name: string;
  icon: string;
  ownerId: string;
};

export type StripeKeys = {
  stripePublishableKey: string;
  stripeSecretKey: string;
  stripeWebhookSecret: string;
};

export type UserSubscription = {
  userId: string;
  subscriptionId: string;
  subscriptionStatus: Stripe.Subscription.Status;
  customerId: string;
  guildId: string;
  roles: string[];
  sellerId: string;
  guildName: string;
  guildIcon: string;
  tierId: string;
};

export type WithSubmit<T> = T & {
  submit: unknown;
};

export class ApiError extends Error {
  constructor(message: string, public status: number) {
    super(message);
  }
}
