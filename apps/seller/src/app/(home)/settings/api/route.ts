import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../../auth";
import { CustomerPaths } from "@stripe-discord/db-lib";
import * as yup from "yup";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const user = session.user;

    const dbRef = CustomerPaths.customerByUserId(user.id);

    const res = (await dbRef.get()).data();

    const settings = {
      stripePublishableKey: res?.stripePublishableKey || "",
      stripeSecretKey: res?.stripeSecretKey || "",
      stripeWebhookSecret: res?.stripeWebhookSecret || "",
    };

    // Return the URL for client-side redirection
    return NextResponse.json(
      {
        settings,
        webhookUrl: `${process.env.NEXT_PUBLIC_STRIPE_WEBHOOK_BASEURL}?sellerId=${user.id}`,
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

const validationSchema = yup.object({
  stripePublishableKey: yup.string().required(),
  stripeSecretKey: yup.string().required(),
  stripeWebhookSecret: yup.string().required(),
});

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate the request body against the schema
    const validatedData = await validationSchema.validate(data);

    const session = await auth();

    if (!session) {
      return NextResponse.json(
        { error: "The user is not authenticated." },
        { status: 401 }
      );
    }

    const user = session.user;

    const serverRef = CustomerPaths.customerByUserId(user.id);
    await serverRef.set(validatedData, { merge: true });

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
