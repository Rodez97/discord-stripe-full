import { firestore } from "firebase-admin";
import { auth } from "../../../../auth";
import { NextRequest, NextResponse } from "next/server";
import {
  AdminMonetizedServersFirestoreConverter,
  CustomerPaths,
  TierPaths,
} from "@stripe-discord/db-lib";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const guildId = searchParams.get("guildId");

    if (!guildId || typeof guildId !== "string") {
      throw new Error("No server id");
    }

    const session = await auth();

    if (!session) {
      throw new Error("The user is not authenticated.");
    }

    const serverRef = firestore()
      .collection("monetizedServers")
      .doc(guildId)
      .withConverter(AdminMonetizedServersFirestoreConverter);

    const server = (await serverRef.get()).data();

    if (!server) {
      throw new Error("Server not found");
    }

    const { ownerId } = server;

    const customerRef = CustomerPaths.customerByUserId(ownerId);
    const integrationSettings = (await customerRef.get()).data();

    if (
      integrationSettings?.stripeSubscriptionStatus !== "active" &&
      integrationSettings?.stripeSubscriptionStatus !== "trialing"
    ) {
      throw new Error(
        "The tiers for this server are not available at the moment"
      );
    }

    const dbRef = TierPaths.userServerTiers(ownerId, guildId);

    const res = await dbRef.get();

    // Return the URL for client-side redirection
    return NextResponse.json({
      tiers: res.empty ? [] : res.docs.map((doc) => doc.data()),
      guild: server,
    });
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
