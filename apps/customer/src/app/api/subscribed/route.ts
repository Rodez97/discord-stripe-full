import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";
import { NextRequest, NextResponse } from "next/server";
import auth from "../../../middleware";
import { UserSubscriptions } from "@stripe-discord/db-lib";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
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
    console.error("Error:", error);
    return new NextResponse(JSON.stringify(error), {
      status: 500,
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
      return NextResponse.json({ error: "No server id" }, { status: 400 });
    }

    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const user = session.user;
    const { id, accessToken } = user;

    const userSubscriptionRef = UserSubscriptions.userSubscriptionByServerId(
      id,
      guildId
    );

    const userSubscriptionSnapshot = await userSubscriptionRef.get();

    if (userSubscriptionSnapshot.empty) {
      return NextResponse.json({ error: "No subscription" }, { status: 400 });
    }

    const userSubscription = userSubscriptionSnapshot.docs[0].data();

    const { subscriptionStatus, roles } = userSubscription;

    if (subscriptionStatus !== "active" && subscriptionStatus !== "trialing") {
      return NextResponse.json(
        { error: "Subscription not active" },
        { status: 400 }
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
    console.error("Error:", error);
    return new NextResponse(JSON.stringify(error), {
      status: 500,
    });
  }
}
