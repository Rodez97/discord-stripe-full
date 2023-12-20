import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { NextRequest, NextResponse } from "next/server";
import auth from "../../../../middleware";
import { UserSubscriptions } from "@stripe-discord/db-lib";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      throw new Error("The user is not authenticated.");
    }

    const user = session.user;

    const dbRef = UserSubscriptions.userSubscriptionByUserId(user.id);

    const res = await dbRef.get();

    // Return the URL for client-side redirection
    return NextResponse.json({
      guilds: res.empty ? [] : res.docs.map((doc) => doc.data()),
    });
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

export async function POST(req: NextRequest) {
  try {
    const discordRest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_BOT_TOKEN
    );

    const data = await req.json();
    const guildId = data.guildId;

    if (!guildId || typeof guildId !== "string") {
      throw new Error("No server id");
    }

    const session = await auth();

    if (!session) {
      throw new Error("The user is not authenticated.");
    }

    const user = session.user;
    const { id, accessToken } = user;

    const userSubscriptionRef = UserSubscriptions.userSubscriptionByServerId(
      id,
      guildId
    );

    const userSubscriptionSnapshot = await userSubscriptionRef.get();

    if (userSubscriptionSnapshot.empty) {
      throw new Error("User subscription not found");
    }

    const userSubscription = userSubscriptionSnapshot.docs[0].data();

    const { subscriptionStatus, roles } = userSubscription;

    if (subscriptionStatus !== "active" && subscriptionStatus !== "trialing") {
      throw new Error("Subscription not active");
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

    return NextResponse.json({
      success: true,
    });
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
