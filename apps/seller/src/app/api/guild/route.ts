import { firestore } from "firebase-admin";
import { auth } from "../../../../auth";
import {
  CustomerPaths,
  MonetizedServers,
  TierPaths,
} from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const guildId = data.guildId;

    if (!guildId || typeof guildId !== "string") {
      return new NextResponse(null, {
        status: 400,
        statusText: "Invalid guild id",
      });
    }

    const session = await auth();

    if (!session) {
      return new NextResponse(null, {
        status: 401,
        statusText: "The user is not authenticated.",
      });
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      return new NextResponse(null, {
        status: 403,
        statusText: "The user is not subscribed.",
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

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId || typeof guildId !== "string") {
      return NextResponse.json({ error: "Invalid guild id" }, { status: 400 });
    }

    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const user = session.user;

    const isSubscribed = user.subscription;

    if (!isSubscribed) {
      return NextResponse.json(
        { error: "The user is not subscribed." },
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
