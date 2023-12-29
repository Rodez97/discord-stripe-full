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

    const user = session.user;

    const isSubscribed = user.subscription;

    const dbRef = MonetizedServers.monetizedServers(user.id);

    const res = await dbRef.get();

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        isSubscribed,
        guilds: res.empty ? [] : res.docs.map((doc) => doc.data()),
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
