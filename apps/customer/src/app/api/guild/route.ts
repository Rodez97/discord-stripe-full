import { auth } from "../../../../auth";
import { NextRequest, NextResponse } from "next/server";
import {
  CustomerPaths,
  TierPaths,
  MonetizedServers,
} from "@stripe-discord/db-lib";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      throw new ApiError("No server id", 400);
    }

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const serverSnapshot = await MonetizedServers.monetizedServerById(
      guildId
    ).get();

    const server = serverSnapshot.data();

    if (!server) {
      throw new ApiError("Server not found", 404);
    }

    const { ownerId } = server;

    const customerRef = CustomerPaths.customerByUserId(ownerId);
    const integrationSettings = (await customerRef.get()).data();

    if (
      integrationSettings?.stripeSubscriptionStatus !== "active" &&
      integrationSettings?.stripeSubscriptionStatus !== "trialing"
    ) {
      throw new ApiError(
        "The tiers for this server are not available at the moment.",
        400
      );
    }

    const dbRef = TierPaths.userServerTiers(ownerId, guildId);

    const res = await dbRef.get();

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        tiers: res.empty ? [] : res.docs.map((doc) => doc.data()),
        guild: server,
      },
      { status: 200 }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
