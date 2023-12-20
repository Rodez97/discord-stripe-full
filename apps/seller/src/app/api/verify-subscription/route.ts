import { CustomerPaths } from "@stripe-discord/db-lib";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const parsedBody = await req.json();
  const { userId } = parsedBody;

  const customerRef = CustomerPaths.customerByUserId(userId);
  const integrationSettings = (await customerRef.get()).data();

  if (!integrationSettings) {
    return NextResponse.json({ isSub: false });
  }

  const { stripeSubscriptionStatus } = integrationSettings;

  const isSub = Boolean(
    ["active", "trialing"].includes(stripeSubscriptionStatus)
  );

  return NextResponse.json({ isSub });
}
