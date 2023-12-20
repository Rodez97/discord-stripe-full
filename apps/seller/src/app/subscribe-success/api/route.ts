import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const session_id = searchParams.get("session_id");

    if (!session_id || typeof session_id !== "string") {
      return NextResponse.json(
        { error: "Invalid session id" },
        { status: 400 }
      );
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
