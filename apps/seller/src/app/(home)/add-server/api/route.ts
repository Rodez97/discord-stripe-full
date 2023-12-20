import { CustomerPaths, MonetizedServers } from "@stripe-discord/db-lib";
import * as yup from "yup";
import { checkBotInServer } from "../../../../lib/DiscordGuildHelpers";
import { NextRequest, NextResponse } from "next/server";
import { APIGuild } from "discord-api-types/v10";
import { firestore } from "firebase-admin";
import { auth } from "../../../../../auth";
import { MonetizedServer } from "@stripe-discord/types";

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

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      return NextResponse.json(
        { error: "The user is not subscribed." },
        { status: 403 }
      );
    }

    const dbRef = MonetizedServers.monetizedServers(user.id).count();

    const res = await dbRef.get();

    if (res.data().count >= 10) {
      return NextResponse.json(
        { error: "You can only add 10 servers." },
        { status: 403 }
      );
    }

    const request = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });

    if (!request.ok) {
      return NextResponse.json(
        { error: "Error while fetching the servers." },
        { status: 500 }
      );
    }

    const servers = (await request.json()) as APIGuild[];

    const availableServers: APIGuild[] = servers.filter((guild) => guild.owner);

    if (availableServers.length === 0) {
      return NextResponse.json(
        { error: "The user is not the owner of any server." },
        { status: 403 }
      );
    }

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        availableServers,
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

const validationSchema = yup.object({
  id: yup.string().required(),
  name: yup.string().required(),
  icon: yup.string(),
});

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate the request body against the schema
    const { id, name, icon } = await validationSchema.validate(data);

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

    const botIsInServer = await checkBotInServer(id);

    if (!botIsInServer) {
      return NextResponse.json(
        { error: "The bot is not in the server." },
        { status: 400 }
      );
    }

    const serverData: MonetizedServer = {
      id,
      name,
      icon: icon || "",
      ownerId: user.id,
      botIsInServer,
    };

    const checkServerRef = MonetizedServers.monetizedServer(
      serverData.id,
      user.id
    ).count();

    // Check if the server already exists
    const serverSnapshot = (await checkServerRef.get()).data();

    if (serverSnapshot.count) {
      return NextResponse.json(
        { error: "The server is already monetized." },
        { status: 400 }
      );
    }

    const batch = firestore().batch();

    const serverRef = firestore()
      .collection("monetizedServers")
      .doc(serverData.id);

    batch.set(serverRef, serverData);

    batch.set(
      CustomerPaths.customerByUserId(user.id),
      {
        numberOfGuilds: firestore.FieldValue.increment(1),
      },
      { merge: true }
    );

    await batch.commit();

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
