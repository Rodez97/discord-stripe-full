import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { NextRequest, NextResponse } from "next/server";
import auth from "../../../middleware";
import { UserSubscriptions } from "@stripe-discord/db-lib";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;

    const dbRef = UserSubscriptions.userSubscriptionByUserId(user.id);

    const res = await dbRef.get();

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        guilds: res.empty ? [] : res.docs.map((doc) => doc.data()),
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const discordRest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_BOT_TOKEN
    );

    const data = await req.json();
    const guildId = data.guildId;

    if (!guildId || typeof guildId !== "string") {
      throw new ApiError("No server id", 400);
    }

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;
    const { id, accessToken } = user;

    const userSubscriptionRef = UserSubscriptions.userSubscriptionByServerId(
      id,
      guildId
    );

    const userSubscriptionSnapshot = await userSubscriptionRef.get();

    if (userSubscriptionSnapshot.empty) {
      throw new ApiError(
        "We couldn't find your subscription for this server.",
        404
      );
    }

    const userSubscription = userSubscriptionSnapshot.docs[0].data();

    const { subscriptionStatus, roles } = userSubscription;

    if (subscriptionStatus !== "active" && subscriptionStatus !== "trialing") {
      throw new ApiError(
        "Your subscription for this server is not active.",
        400
      );
    }

    let body: {
      access_token: string;
      roles?: string[];
    } = {
      access_token: accessToken,
    };

    if (roles && roles.length > 0) {
      body = {
        ...body,
        roles,
      };
    }

    // Add the designated Discord role to the user
    await discordRest.put(Routes.guildMember(guildId, id), {
      body,
    });

    return NextResponse.json(
      {
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
