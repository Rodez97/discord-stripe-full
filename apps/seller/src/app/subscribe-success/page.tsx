"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import useSWR, { Fetcher } from "swr";
import ErrorPage from "../error";
import { useSearchParams } from "next/navigation";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import { mainFetcher } from "@stripe-discord/lib";
import Main from "@stripe-discord/ui/components/Main";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

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

  return (
    <Main>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        {status === "complete" ? (
          <CheckCircleIcon sx={{ fontSize: 100 }} color="success" />
        ) : (
          <ErrorIcon sx={{ fontSize: 100 }} color="error" />
        )}
        <Typography variant="h2">
          {status === "complete" ? "Success!" : "Cancelled!"}
        </Typography>
        <Typography variant="body1">
          {status === "complete"
            ? "You have successfully subscribed to the Discord and Stripe Integration!"
            : "You have cancelled the subscription process."}
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
    </Main>
  );
}

export default MonetizedServersPage;
