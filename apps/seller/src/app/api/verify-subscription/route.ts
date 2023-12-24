import { CustomerPaths } from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const parsedBody = await req.json();
    const { userId } = parsedBody;

    const customerSnapshot = await CustomerPaths.customerByUserId(userId).get();
    const integrationSettings = customerSnapshot.data();

    if (
      !integrationSettings ||
      !integrationSettings.stripeCustomerId ||
      !integrationSettings.stripeSubscriptionId
    ) {
      return NextResponse.json({ isSub: false }, { status: 200 });
    }

    return NextResponse.json(
      { isSub: true, status: integrationSettings.stripeSubscriptionStatus },
      { status: 200 }
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
