import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { MonetizedServers, TierPaths } from "@stripe-discord/db-lib";

export async function DELETE(req: NextRequest) {
  try {
    const data = await req.json();
    const tierId = data.tierId;

    if (!tierId || typeof tierId !== "string") {
      return NextResponse.json({ error: "Invalid tier id" }, { status: 400 });
    }

    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const tierRef = TierPaths.tier(tierId);
    await tierRef.delete();

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
    return new NextResponse(JSON.stringify(error), {
      status: 500,
      statusText: errorMessage,
    });
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
    return new NextResponse(JSON.stringify(error), {
      status: 500,
      statusText: errorMessage,
    });
  }
}
