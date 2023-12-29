import { MonetizedServers } from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";
import { APIGuild, Routes } from "discord-api-types/v10";
import { ApiError, MonetizedServer } from "@stripe-discord/types";
import { auth } from "../../../../auth";
import { handleApiError } from "@stripe-discord/lib";
import { guildValidationSchema } from "../../../lib/validationSchemas";
import { REST } from "@discordjs/rest";

export async function GET() {
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

    const monetizedGuildsCountSnapshot =
      await MonetizedServers.monetizedServers(user.id).count().get();

    const totalGuilds = monetizedGuildsCountSnapshot.data().count;

    if (totalGuilds >= 10) {
      throw new ApiError("You can only add 10 servers.", 403);
    }

    const request = await fetch("https://discord.com/api/users/@me/guilds", {
      headers: {
        Authorization: `Bearer ${user.accessToken}`,
      },
    });

    if (!request.ok) {
      console.error("Error:", request);
      throw new ApiError("Error while fetching the servers.", 500);
    }

    const servers = (await request.json()) as APIGuild[];

    const availableServers = servers.filter((guild) => guild.owner);

    if (availableServers.length === 0) {
      throw new ApiError("You are not the owner of any server.", 400);
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
    return handleApiError(error);
  }
}

export async function PUT(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate the request body against the schema
    const { id, name, icon } = await guildValidationSchema.validate(data);

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      throw new ApiError("The user is not subscribed.", 403);
    }

    const botIsInServer = await checkBotInServer(id);

    if (!botIsInServer) {
      throw new ApiError(
        "The bot is not in the server, make sure to add it.",
        400
      );
    }

    const serverData: MonetizedServer = {
      id,
      name,
      icon: icon || "",
      ownerId: user.id,
    };

    const serverSnapshot = await MonetizedServers.monetizedServer(
      serverData.id,
      user.id
    )
      .count()
      .get();

    // Check if the server already exists
    const serverSnapshotData = serverSnapshot.data();

    if (serverSnapshotData.count) {
      throw new ApiError("The server is already monetized.", 400);
    }

    const serverRef = MonetizedServers.monetizedServerById(serverData.id);

    await serverRef.set(serverData);

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

// Utils
async function checkBotInServer(serverId: string) {
  try {
    const discordRest = new REST({ version: "10" }).setToken(
      process.env.DISCORD_BOT_TOKEN
    );

    const checkBot = await discordRest.get(Routes.guild(serverId));

    if (checkBot) {
      return true;
    }
  } catch (error) {
    console.error("Error:", error);
  }

  return false;
}
