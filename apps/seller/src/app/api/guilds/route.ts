import { NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { MonetizedServers } from "@stripe-discord/db-lib";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const guilds = await MonetizedServers.monetizedServers(
      session.user.id
    ).get();

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        guilds: guilds.empty ? [] : guilds.docs.map((doc) => doc.data()),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
