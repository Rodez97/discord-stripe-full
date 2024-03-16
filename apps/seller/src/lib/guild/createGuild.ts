"use server";

import { MonetizedServers } from "@stripe-discord/db-lib";
import { auth } from "../../../auth";
import { Routes } from "discord-api-types/v10";
import { REST } from "@discordjs/rest";
import { MonetizedServer } from "@stripe-discord/types";
import { revalidatePath } from "next/cache";

type Guild = {
  icon?: string;
  id: string;
  name: string;
};

export const createGuild = async (guild: Guild) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  const { id, name, icon } = guild;

  const botIsInServer = await checkBotInServer(id);

  if (!botIsInServer) {
    throw new Error("The bot is not in the server.");
  }

  const serverData: MonetizedServer = {
    id,
    name,
    icon: icon || "",
    ownerId: user.id,
  };

  const db = MonetizedServers.collection.firestore;

  await db.runTransaction(async (transaction) => {
    const serverRef = MonetizedServers.monetizedServerById(serverData.id);

    const serverSnapshot = await transaction.get(serverRef);

    // Check if the server already exists
    if (serverSnapshot.exists) {
      throw new Error("The server already exists.");
    }

    transaction.set(serverRef, serverData);
  });

  revalidatePath("/");
};

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
