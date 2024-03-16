"use server";

import { MonetizedServers, TierPaths } from "@stripe-discord/db-lib";
import { auth } from "../../../auth";
import { firestore } from "firebase-admin";
import { revalidatePath } from "next/cache";

export const deleteGuild = async (guildId: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  const batch = firestore().batch();

  const tiers = await TierPaths.userServerTiers(user.id, guildId).get();

  if (tiers.size > 0) {
    tiers.forEach((tier) => {
      batch.delete(tier.ref);
    });
  }

  batch.delete(MonetizedServers.monetizedServerById(guildId));

  await batch.commit();

  revalidatePath("/");
};
