import { auth } from "../../../../../auth";
import { checkStripeData } from "../../../../lib/stripe-utils";
import Stripe from "stripe";
import { firestore } from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { APIRole } from "discord-api-types/v10";
import { newTierValidationSchema } from "../../../../lib/validationSchemas";
import { TierPaths } from "@stripe-discord/db-lib";
import { ApiError, DiscordTierWithPrices } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      throw new ApiError("Guild ID is missing or invalid", 400);
    }

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      throw new ApiError("The user is not subscribed.", 403);
    }

    const rolesRequest = await fetch(
      `https://discord.com/api/guilds/${guildId}/roles`,
      {
        headers: {
          Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        },
      }
    );

    if (!rolesRequest.ok) {
      console.error("Error:", rolesRequest);
      throw new ApiError("Error while fetching the roles.", 500);
    }

    const rolesData = (await rolesRequest.json()) as APIRole[];

    const roles = rolesData ? rolesData.filter((role) => !role.managed) : [];

    if (!roles.length) {
      throw new ApiError("The server has no available roles.", 400);
    }

    return NextResponse.json(
      {
        roles,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      throw new ApiError("The user is not subscribed.", 403);
    }

    const data = await req.json();
    const { serverId, ...tierData } = data;

    if (!serverId || typeof serverId !== "string") {
      throw new ApiError("Invalid server ID", 400);
    }

    const validatedTierData = await newTierValidationSchema.validate(tierData);

    const { productId, monthlyPriceId, yearlyPriceId } = validatedTierData;

    // Check that there are stripe settings
    const integrationSettings = await checkStripeData(user.id);
    const { stripeSecretKey } = integrationSettings;

    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: "2023-10-16",
    });

    let tierWithPrices: firestore.WithFieldValue<DiscordTierWithPrices> = {
      ...validatedTierData,
      guildId: serverId,
      sellerId: user.id,
    } as DiscordTierWithPrices;

    // Use stripe to verify that the product and prices exist, and the prices are for the provided product
    const product = await stripe.products.retrieve(productId);

    if (!product) {
      throw new ApiError("Invalid product ID", 400);
    }

    const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId);

    if (!monthlyPrice) {
      throw new ApiError("Invalid monthly price ID", 400);
    }

    if (monthlyPrice.product !== productId) {
      throw new ApiError(
        "The monthly price ID is not for the provided product ID",
        400
      );
    }

    if (monthlyPrice.recurring?.interval !== "month") {
      throw new ApiError(
        "The monthly price is not a monthly recurring price",
        400
      );
    }

    tierWithPrices.monthlyPriceQty = monthlyPrice.unit_amount
      ? monthlyPrice.unit_amount / 100
      : 0;

    if (yearlyPriceId) {
      const yearlyPrice = await stripe.prices.retrieve(yearlyPriceId);

      if (!yearlyPrice) {
        throw new ApiError("Invalid yearly price ID", 400);
      }

      if (yearlyPrice.product !== productId) {
        throw new ApiError(
          "The yearly price ID is not for the provided product ID",
          400
        );
      }

      if (yearlyPrice.recurring?.interval !== "year") {
        throw new ApiError(
          "The yearly price is not a yearly recurring price",
          400
        );
      }

      tierWithPrices.yearlyPriceQty = yearlyPrice.unit_amount
        ? yearlyPrice.unit_amount / 100
        : 0;
    }

    tierWithPrices.currency = monthlyPrice.currency;

    await TierPaths.collection.add(tierWithPrices);

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
