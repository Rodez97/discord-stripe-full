import { auth } from "../../../../auth";
import { NextRequest, NextResponse } from "next/server";
import {
  CustomerPaths,
  TierPaths,
  MonetizedServers,
} from "@stripe-discord/db-lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId) {
      return NextResponse.json({ error: "No server id" }, { status: 400 });
    }

    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const serverSnapshot = await MonetizedServers.monetizedServerById(
      guildId
    ).get();

    const server = serverSnapshot.data();

    if (!server) {
      return NextResponse.json({ error: "Server not found" }, { status: 404 });
    }

    const { ownerId } = server;

    const customerRef = CustomerPaths.customerByUserId(ownerId);
    const integrationSettings = (await customerRef.get()).data();

    if (
      integrationSettings?.stripeSubscriptionStatus !== "active" &&
      integrationSettings?.stripeSubscriptionStatus !== "trialing"
    ) {
      return NextResponse.json(
        { error: "The tiers for this server are not available at the moment" },
        { status: 400 }
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
    console.error("Error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "There was an error fetching the tiers for this server.",
      },
      { status: 500 }
    );
  }
}
