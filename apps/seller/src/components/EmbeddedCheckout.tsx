"use client";
import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Box } from "@mui/material";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
);

function EmbeddedCheckoutPage({ clientSecret }: { clientSecret: string }) {
  return (
    <Main>
      <CommonNavbar title="Subscribe" backHref="/" />
      <Box
        id="checkout"
        sx={{
          justifyContent: "center",
          alignItems: "center",
          paddingTop: "4rem",
        }}
      >
        <EmbeddedCheckoutProvider
          stripe={stripePromise}
          options={{ clientSecret }}
        >
          <EmbeddedCheckout />
        </EmbeddedCheckoutProvider>
      </Box>
    </Main>
  );
}

export default EmbeddedCheckoutPage;
