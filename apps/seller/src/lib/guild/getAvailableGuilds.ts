"use server";

import { auth } from "../../../auth";
import { cache } from "react";
import type { APIGuild } from "discord-api-types/v10";

export const getAvailableGuilds = cache(async () => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  const request = await fetch("https://discord.com/api/users/@me/guilds", {
    headers: {
      Authorization: `Bearer ${user.accessToken}`,
    },
  });

  if (!request.ok) {
    console.error("Error:", request);
    throw new Error("Error while fetching the servers.");
  }

  const guilds = (await request.json()) as APIGuild[];

  const availableGuilds = guilds.filter((guild) => guild.owner);

  if (availableGuilds.length === 0) {
    throw new Error("You are not the owner of any server.");
  }

  return availableGuilds;
});
