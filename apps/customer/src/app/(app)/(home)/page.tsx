"use client";
import React from "react";
import { Box, Typography } from "@mui/material";
import useSWR, { Fetcher } from "swr";
import SubscriberServerCard from "../../../components/SubscriberServerCard";
import { UserSubscription } from "@stripe-discord/types";
import { mainFetcher } from "@stripe-discord/lib";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import ErrorPage from "../../error";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";

const fetcher: Fetcher<
  {
    guilds: UserSubscription[];
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

function MonetizedServersPage() {
  const { data, error, isLoading } = useSWR("/subscribed", fetcher);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!data) {
    return <ErrorPage error={new Error("There are no guilds")} />;
  }

  const { guilds } = data;

  return (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <CommonNavbar title={`Subscribed servers (${guilds.length})`} />

      {guilds.length === 0 && (
        <Typography
          variant="body1"
          sx={{
            color: "gray",
            textAlign: "center",
          }}
        >
          You are not subscribed to any servers.
        </Typography>
      )}

      <Box
        sx={{
          height: "100%",
          gap: "1rem",
          flexWrap: "wrap",
          marginTop: "1rem",
          display: "flex",
          padding: "1rem",
          alignContent: "flex-start",
        }}
      >
        {guilds.map((guild) => (
          <SubscriberServerCard key={guild.subscriptionId} guild={guild} />
        ))}
      </Box>
    </Box>
  );
}

export default MonetizedServersPage;
