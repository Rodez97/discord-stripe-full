"use server";

import { MonetizedServers } from "@stripe-discord/db-lib";
import { auth } from "../../../auth";
import { cache } from "react";

export const getGuilds = cache(async () => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  const guilds = await MonetizedServers.monetizedServers(user.id).get();

  return guilds.empty ? [] : guilds.docs.map((doc) => doc.data());
});
