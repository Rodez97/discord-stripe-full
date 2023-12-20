"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import useSWR, { Fetcher } from "swr";
import ErrorPage from "../error";
import { useSearchParams } from "next/navigation";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import { mainFetcher } from "@stripe-discord/lib";

const fetcher: Fetcher<
  {
    status: "complete" | "expired" | "open";
    payment_status: "no_payment_required" | "paid" | "unpaid";
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

function MonetizedServersPage() {
  const searchParams = useSearchParams();
  const session_id = searchParams.get("session_id");
  const { data, error, isLoading } = useSWR(
    `/subscribe-success/api?session_id=${session_id}`,
    fetcher
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!data) {
    return <ErrorPage error={new Error("There was an error loading data")} />;
  }

  const { status } = data;

  if (status === "complete") {
    // Create a success page
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h1">Success!</Typography>
        <Typography variant="body1">
          You have successfully subscribed to the Discord and Stripe Integration
          Bot!
        </Typography>

        <Button
          variant="contained"
          color="primary"
          href="/"
          sx={{
            mt: 2,
          }}
        >
          Monetize your servers now!
        </Button>
      </Box>
    );
  } else {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
        }}
      >
        <Typography variant="h1">Cancelled!</Typography>
        <Typography variant="body1">
          Ypu have cancelled the subscription process.
        </Typography>

        <Button
          variant="contained"
          color="primary"
          href="/"
          sx={{
            mt: 2,
          }}
        >
          Go back to the home page
        </Button>
      </Box>
    );
  }
}

export default MonetizedServersPage;
