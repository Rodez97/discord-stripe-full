import { firestore } from "firebase-admin";
import { auth } from "../../../../../auth";
import {
  CustomerPaths,
  MonetizedServers,
  TierPaths,
} from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";

/**
 * Handles DELETE request for unsubscribing a server.
 * @param {NextRequest} req - The Next.js request object.
 * @param {{ params: { guildId: string } }} params - The request parameters.
 * @returns {Promise<NextResponse>} The Next.js response.
 */
export async function DELETE(
  req: NextRequest,
  { params }: { params: { guildId: string } }
): Promise<NextResponse> {
  try {
    const { guildId } = params;

    // Authenticate the user
    const session = await auth();

    if (!session) {
      return new NextResponse(null, {
        status: 401,
        statusText: "User authentication failed.",
      });
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      return new NextResponse(null, {
        status: 403,
        statusText: "User is not subscribed.",
      });
    }

    const { id } = user;

    const tiers = await TierPaths.userServerTiers(id, guildId).get();

    // Check if the user has a Stripe customer
    const customerRef = CustomerPaths.customerByUserId(user.id);

    const batch = firestore().batch();

    if (tiers.size > 0) {
      tiers.forEach((tier) => {
        batch.delete(tier.ref);
      });
    }

    const serverRef = firestore().collection("monetizedServers").doc(guildId);

    batch.delete(serverRef);

    batch.set(
      customerRef,
      {
        numberOfGuilds: firestore.FieldValue.increment(-1),
      },
      { merge: true }
    );

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
    console.error("Error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}

/**
 * Handles GET request to retrieve tiers for a subscribed server.
 * @param {NextRequest} req - The Next.js request object.
 * @param {{ params: { guildId: string } }} params - The request parameters.
 * @returns {Promise<NextResponse>} The Next.js response.
 */
export async function GET(
  req: NextRequest,
  { params }: { params: { guildId: string } }
): Promise<NextResponse> {
  try {
    const { guildId } = params;

    // Authenticate the user
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "User authentication failed." },
        { status: 401 }
      );
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      return NextResponse.json(
        { error: "User is not subscribed." },
        { status: 403 }
      );
    }

    const serverRef = MonetizedServers.monetizedServer(
      guildId,
      user.id
    ).count();

    const server = (await serverRef.get()).data();

    if (!server.count) {
      return NextResponse.json(
        { error: "The server is not monetized." },
        { status: 400 }
      );
    }

    const dbRef = TierPaths.userServerTiers(user.id, guildId);

    const res = await dbRef.get();

    // Return tiers or empty array if none
    return NextResponse.json(
      {
        tiers: res.empty ? [] : res.docs.map((doc) => doc.data()),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error:", error);
    let errorMessage = "Unknown error";
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json(
      {
        error: errorMessage,
      },
      {
        status: 500,
      }
    );
  }
}
