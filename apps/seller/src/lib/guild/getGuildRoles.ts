"use server";

import { auth } from "../../../auth";
import { cache } from "react";
import type { APIRole } from "discord-api-types/v10";

export const getGuildRoles = cache(async (guildId: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
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
    throw new Error("Error while fetching the roles.");
  }

  const rolesData = (await rolesRequest.json()) as APIRole[];

  const roles = rolesData ? rolesData.filter((role) => !role.managed) : [];

  if (!roles.length) {
    throw new Error("The server has no available roles.");
  }

  return roles;
});
