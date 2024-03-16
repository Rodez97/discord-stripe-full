"use server";

import { revalidatePath } from "next/cache";
import { auth } from "../../../auth";
import { TierPaths } from "@stripe-discord/db-lib";

export const deleteTier = async (tierId: string, serverId: string) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const db = TierPaths.collection.firestore;
  await db.runTransaction(async (transaction) => {
    const tierRef = TierPaths.tier(tierId);
    const tier = (await transaction.get(tierRef)).data();

    if (!tier) {
      throw new Error("The tier does not exist.");
    }

    if (tier.sellerId !== session.user.id) {
      throw new Error("The user is not the owner of the tier.");
    }

    transaction.delete(tierRef);
  });

  revalidatePath(`/${serverId}`);
};
