"use server";

import { auth } from "../../../auth";
import { CustomerPaths } from "@stripe-discord/db-lib";
import { StripeKeys } from "@stripe-discord/types";
import { revalidatePath } from "next/cache";

export const updateSettings = async (keys: StripeKeys) => {
  const session = await auth();

  if (!session) {
    throw new Error("The user is not authenticated.");
  }

  const user = session.user;

  if (!user.subscription) {
    throw new Error("The user is not subscribed.");
  }

  await CustomerPaths.customerByUserId(user.id).set(keys, {
    merge: true,
  });

  revalidatePath("/settings");
};
