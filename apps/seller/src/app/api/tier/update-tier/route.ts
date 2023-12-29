import { auth } from "../../../../../auth";
import { TierPaths } from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";
import { APIRole } from "discord-api-types/v10";
import { editTierValidationSchema } from "../../../../lib/validationSchemas";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");
    const tierId = searchParams.get("tierId");

    if (!guildId) {
      throw new ApiError("Guild ID is missing or invalid", 400);
    }

    if (!tierId) {
      throw new ApiError("Tier ID is missing or invalid", 400);
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

    const tier = (await TierPaths.tier(tierId).get()).data();

    if (!tier) {
      throw new ApiError("The tier does not exist.", 400);
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

    return NextResponse.json(
      {
        roles,
        tier,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const data = await req.json();
    const { tierId, ...tierData } = data;

    if (!tierId || typeof tierId !== "string") {
      throw new ApiError("Invalid tier id", 400);
    }

    const validatedTierData = await editTierValidationSchema.validate(tierData);

    const tierRef = TierPaths.tier(tierId);
    await tierRef.update(validatedTierData);

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
