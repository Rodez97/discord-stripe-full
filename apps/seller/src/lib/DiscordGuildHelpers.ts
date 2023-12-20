"use server";
import { REST } from "@discordjs/rest";
import { Routes } from "discord-api-types/v10";

const discordRest = new REST({ version: "10" }).setToken(
  process.env.DISCORD_BOT_TOKEN
);

export async function checkBotInServer(serverId: string) {
  try {
    const checkBot = await discordRest.get(Routes.guild(serverId));

    if (checkBot) {
      return true;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    } else {
      console.error(error);
    }
  }

  return false;
}
