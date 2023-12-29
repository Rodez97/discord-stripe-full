import { NextRequest, NextResponse } from "next/server";
import { auth } from "../../../../auth";
import { CustomerPaths } from "@stripe-discord/db-lib";
import { ApiError } from "@stripe-discord/types";
import { handleApiError } from "@stripe-discord/lib";
import { stripeSettingsValidationSchema } from "../../../lib/validationSchemas";

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;

    const customerSnapshot = await CustomerPaths.customerByUserId(
      user.id
    ).get();

    const data = customerSnapshot.data();

    const settings = {
      stripePublishableKey: data?.stripePublishableKey || "",
      stripeSecretKey: data?.stripeSecretKey || "",
      stripeWebhookSecret: data?.stripeWebhookSecret || "",
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
    return handleApiError(error);
  }
}

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    // Validate the request body against the schema
    const validatedData = await stripeSettingsValidationSchema.validate(data);

    const session = await auth();

    if (!session) {
      throw new ApiError("The user is not authenticated.", 401);
    }

    const user = session.user;

    await CustomerPaths.customerByUserId(user.id).set(validatedData, {
      merge: true,
    });

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
    return handleApiError(error);
  }
}
