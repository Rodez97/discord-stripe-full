import { handleApiError } from "@stripe-discord/lib";
import { ApiError } from "@stripe-discord/types";
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id) {
      throw new ApiError("Session ID is missing or invalid", 400);
    }

    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        status: session.status,
        payment_status: session.payment_status,
      },
      {
        status: 200,
      }
    );
  } catch (error) {
    return handleApiError(error);
  }
}
