import { auth } from "../../../../../auth";
import { checkStripeData } from "../../../../lib/stripe-utils";
import Stripe from "stripe";
import { firestore } from "firebase-admin";
import { NextRequest, NextResponse } from "next/server";
import { APIRole } from "discord-api-types/v10";
import { newTierValidationSchema } from "../../../../validation-schemas/tier";
import { TierPaths } from "@stripe-discord/db-lib";
import { DiscordTierWithPrices } from "@stripe-discord/types";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId || typeof guildId !== "string") {
      return NextResponse.json({ error: "Invalid guild id" }, { status: 400 });
    }

    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      return NextResponse.json(
        { error: "The user is not subscribed." },
        { status: 403 }
      );
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
      return NextResponse.json(
        { error: "Error while fetching the roles." },
        { status: 500 }
      );
    }

    const rolesData = (await rolesRequest.json()) as APIRole[];

    const roles: APIRole[] = rolesData
      ? rolesData.filter((role) => !role.managed)
      : [];

    if (!roles.length) {
      return NextResponse.json(
        { error: "The server has no available roles." },
        { status: 400 }
      );
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

export async function PUT(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      return NextResponse.json(
        { error: "The user is not subscribed." },
        { status: 403 }
      );
    }

    const data = await req.json();
    const { serverId, ...tierData } = data;

    if (!serverId || typeof serverId !== "string") {
      return NextResponse.json({ error: "Invalid server id" }, { status: 400 });
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
      return NextResponse.json(
        { error: "Invalid product ID" },
        { status: 400 }
      );
    }

    const monthlyPrice = await stripe.prices.retrieve(monthlyPriceId);

    if (!monthlyPrice) {
      return NextResponse.json(
        { error: "Invalid monthly price ID" },
        { status: 400 }
      );
    }

    if (monthlyPrice.product !== productId) {
      return NextResponse.json(
        { error: "The monthly price ID is not for the provided product ID" },
        { status: 400 }
      );
    }

    if (monthlyPrice.recurring?.interval !== "month") {
      return NextResponse.json(
        { error: "The monthly price is not a monthly recurring price" },
        { status: 400 }
      );
    }

    tierWithPrices.monthlyPriceQty = monthlyPrice.unit_amount
      ? monthlyPrice.unit_amount / 100
      : 0;

    if (yearlyPriceId) {
      const yearlyPrice = await stripe.prices.retrieve(yearlyPriceId);

      if (!yearlyPrice) {
        return NextResponse.json(
          { error: "Invalid yearly price ID" },
          { status: 400 }
        );
      }

      if (yearlyPrice.product !== productId) {
        return NextResponse.json(
          {
            error: "The yearly price ID is not for the provided product ID",
          },
          { status: 400 }
        );
      }

      if (yearlyPrice.recurring?.interval !== "year") {
        return NextResponse.json(
          {
            error: "The yearly price is not a yearly recurring price",
          },
          { status: 400 }
        );
      }

      tierWithPrices.yearlyPriceQty = yearlyPrice.unit_amount
        ? yearlyPrice.unit_amount / 100
        : 0;
    }

    tierWithPrices.currency = monthlyPrice.currency;

    const tierRef = TierPaths.collection;

    await tierRef.add(tierWithPrices);

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
