"use server";

import { cache } from "react";
import { auth } from "../../../auth";
import { TierPaths } from "@stripe-discord/db-lib";

export const getTiers = cache(async (guildId: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  const dbRef = TierPaths.userServerTiers(user.id, guildId);

  const res = await dbRef.get();

  return res.empty ? [] : res.docs.map((doc) => doc.data());
});
