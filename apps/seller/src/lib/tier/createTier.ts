"use server";

import Stripe from "stripe";
import { auth } from "../../../auth";
import { TierPaths, checkStripeData } from "@stripe-discord/db-lib";
import { firestore } from "firebase-admin";
import { DiscordTierWithPrices } from "@stripe-discord/types";
import { revalidatePath } from "next/cache";

type TierData = {
  description?: string;
  yearlyPriceId?: string;
  benefits?: string[];
  nickname: string;
  productId: string;
  monthlyPriceId: string;
  discordRoles: string[];
};

export const createTier = async (serverId: string, tierData: TierData) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  const { productId, monthlyPriceId, yearlyPriceId } = tierData;

  // Check that there are stripe settings
  const integrationSettings = await checkStripeData(user.id);
  const { stripeSecretKey } = integrationSettings;

  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: "2023-10-16",
  });

  let tierWithPrices: firestore.WithFieldValue<DiscordTierWithPrices> = {
    ...tierData,
    guildId: serverId,
    sellerId: user.id,
  } as DiscordTierWithPrices;

  // Use stripe to verify that the product and prices exist, and the prices are for the provided product
  const product = await stripe.products.retrieve(productId);

  if (!product) {
    throw new Error("Invalid product ID");
  }

  const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId);

  if (!monthlyPrice) {
    throw new Error("Invalid monthly price ID");
  }

  if (monthlyPrice.product !== productId) {
    throw new Error("The monthly price ID is not for the provided product ID");
  }

  if (monthlyPrice.recurring?.interval !== "month") {
    throw new Error("The monthly price is not a monthly recurring price");
  }

  tierWithPrices.monthlyPriceQty = monthlyPrice.unit_amount
    ? monthlyPrice.unit_amount / 100
    : 0;

  if (yearlyPriceId) {
    const yearlyPrice = await stripe.prices.retrieve(yearlyPriceId);

    if (!yearlyPrice) {
      throw new Error("Invalid yearly price ID");
    }

    if (yearlyPrice.product !== productId) {
      throw new Error("The yearly price ID is not for the provided product ID");
    }

    if (yearlyPrice.recurring?.interval !== "year") {
      throw new Error("The yearly price is not a yearly recurring price");
    }

    tierWithPrices.yearlyPriceQty = yearlyPrice.unit_amount
      ? yearlyPrice.unit_amount / 100
      : 0;
  }

  tierWithPrices.currency = monthlyPrice.currency;

  await TierPaths.collection.add(tierWithPrices);

  revalidatePath(`/${serverId}`, "page");
};
