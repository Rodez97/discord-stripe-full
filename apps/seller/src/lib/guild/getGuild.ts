"use server";

import { MonetizedServers, TierPaths } from "@stripe-discord/db-lib";
import { auth } from "../../../auth";
import { cache } from "react";

export const getGuild = cache(async (guildId: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  const serverSnapshot = await MonetizedServers.monetizedServer(
    guildId,
    user.id
  ).get();

  if (serverSnapshot.empty) {
    throw new Error("The server is not monetized.");
  }

  return serverSnapshot.docs[0].data();
});
