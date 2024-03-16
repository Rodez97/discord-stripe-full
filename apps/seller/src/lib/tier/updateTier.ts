"use server";

import { auth } from "../../../auth";
import { TierPaths } from "@stripe-discord/db-lib";
import { revalidatePath } from "next/cache";

type TierData = {
  description?: string;
  nickname?: string;
  discordRoles?: string[];
};

export const updateTier = async (
  tierId: string,
  guildId: string,
  tierData: TierData
) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  await TierPaths.tier(tierId).update(tierData);

  revalidatePath(`/${guildId}`, "page");
};
