import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { MonetizedServers, TierPaths } from "@stripe-discord/db-lib";
import { handleApiError } from "@stripe-discord/lib";
import { ApiError } from "@stripe-discord/types";

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const tierId = data.tierId;

    if (!tierId || typeof tierId !== "string") {
      throw new ApiError("Invalid tier id", 400);
    }

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    // Use a transaction to delete the tier and update the server count
    const db = TierPaths.collection.firestore;
    await db.runTransaction(async (transaction) => {
      const tierRef = TierPaths.tier(tierId);
      const tier = (await transaction.get(tierRef)).data();

      if (!tier) {
        throw new ApiError("The tier does not exist.", 400);
      }

      if (tier.sellerId !== session.user.id) {
        throw new ApiError("The user is not the owner of the tier.", 403);
      }

      transaction.delete(tierRef);
    });

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        success: true,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      throw new ApiError("Guild ID is missing or invalid", 400);
    }

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      throw new ApiError("The user is not subscribed.", 403);
    }

    const serverRef = MonetizedServers.monetizedServer(
      guildId,
      user.id
    ).count();

    const server = (await serverRef.get()).data();

    if (!server.count) {
      throw new ApiError("The server is not monetized.", 400);
    }

    const dbRef = TierPaths.userServerTiers(user.id, guildId);

    const res = await dbRef.get();

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        tiers: res.empty ? [] : res.docs.map((doc) => doc.data()),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
