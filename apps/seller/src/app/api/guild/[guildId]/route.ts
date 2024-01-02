import { firestore } from "firebase-admin";
import { auth } from "../../../../../auth";
import { MonetizedServers, TierPaths } from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

export async function DELETE(
  _: NextRequest,
  { params }: { params: { guildId: string } }
) {
  try {
    const { guildId } = params;

    // Authenticate the user
    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const { id, subscription } = session.user;

    if (!subscription) {
      throw new ApiError("The user is not subscribed.", 403);
    }

    const batch = firestore().batch();

    const tiers = await TierPaths.userServerTiers(id, guildId).get();

    if (tiers.size > 0) {
      tiers.forEach((tier) => {
        batch.delete(tier.ref);
      });
    }

    batch.delete(MonetizedServers.monetizedServerById(guildId));

    await batch.commit();

    // Return success response
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

export async function GET(
  _: NextRequest,
  { params }: { params: { guildId: string } }
) {
  try {
    const { guildId } = params;

    // Authenticate the user
    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;

    if (!user.subscription) {
      throw new ApiError("The user is not subscribed.", 403);
    }

    const serverSnapshot = await MonetizedServers.monetizedServer(
      guildId,
      user.id
    ).get();

    if (serverSnapshot.empty) {
      throw new ApiError("The server is not monetized.", 400);
    }

    const dbRef = TierPaths.userServerTiers(user.id, guildId);

    const res = await dbRef.get();

    // Return tiers or empty array if none
    return NextResponse.json(
      {
        tiers: res.empty ? [] : res.docs.map((doc) => doc.data()),
        server: serverSnapshot.docs[0].data(),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
