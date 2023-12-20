import React from "react";
import { createCheckoutSession } from "../../lib/InternalAPIActions";
import EmbeddedCheckoutPage from "../../components/EmbeddedCheckout";
import { auth } from "../../../auth";

async function getData() {
  const session = await auth();

  if (!session) {
    throw new Error("No session");
  }

  const user = session.user;

  const isSubscribed = user.subscription;

  if (isSubscribed) {
    throw new Error("You are already subscribed");
  }

  const client_secret = await createCheckoutSession();

  if (!client_secret) {
    throw new Error("There was an error creating the checkout session");
  }

  return client_secret;
}

async function MonetizedServersPage() {
  const clientSecret = await getData();

  return <EmbeddedCheckoutPage clientSecret={clientSecret} />;
}

export default MonetizedServersPage;
