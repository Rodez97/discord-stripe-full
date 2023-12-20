import { auth } from "../../../../../auth";
import { TierPaths } from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";
import { APIRole } from "discord-api-types/v10";
import { editTierValidationSchema } from "../../../../validation-schemas/tier";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");
    const tierId = searchParams.get("tierId");

    if (!guildId || typeof guildId !== "string") {
      return NextResponse.json({ error: "Invalid guild id" }, { status: 400 });
    }

    if (!tierId || typeof tierId !== "string") {
      return NextResponse.json({ error: "Invalid tier id" }, { status: 400 });
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

    const tier = (await TierPaths.tier(tierId).get()).data();

    if (!tier) {
      return NextResponse.json(
        { error: "The tier does not exist." },
        { status: 400 }
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
    console.error("Error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new NextResponse(JSON.stringify(error), {
      status: 500,
      statusText: errorMessage,
    });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const data = await req.json();
    const { tierId, ...tierData } = data;

    if (!tierId || typeof tierId !== "string") {
      return NextResponse.json({ error: "Invalid tier id" }, { status: 400 });
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
    console.error("Error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return new NextResponse(JSON.stringify(error), {
      status: 500,
      statusText: errorMessage,
    });
  }
}
