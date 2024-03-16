"use client";
import React from "react";
import useSWR, { Fetcher } from "swr";
import SubscriberServerCard from "../../../components/SubscriberServerCard";
import { UserSubscription } from "@stripe-discord/types";
import { mainFetcher } from "@stripe-discord/lib";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import ErrorPage from "../../error";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Main from "@stripe-discord/ui/components/Main";
import Empty from "@stripe-discord/ui/components/Empty";
import CardsContainer from "@stripe-discord/ui/components/CardsContainer";
import { Typography } from "@mui/material";

const fetcher: Fetcher<
  {
    guilds: UserSubscription[];
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

function MonetizedServersPage() {
  const { data, error, isLoading } = useSWR("/api/subscribed", fetcher);

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
    <Main>
      <CommonNavbar title={`Subscribed servers (${guilds.length})`} />

      {guilds.length === 0 ? (
        <Empty variant="body1">
          You are not subscribed to any servers...
          <Typography
            sx={{
              marginTop: "1rem",
              fontSize: "1rem",
              fontWeight: 300,
            }}
          >
            A server owner have to share their server with you to subscribe to
            it.
          </Typography>
        </Empty>
      ) : (
        <CardsContainer>
          {guilds.map((guild) => (
            <SubscriberServerCard key={guild.subscriptionId} guild={guild} />
          ))}
        </CardsContainer>
      )}
    </Main>
  );
}

export default MonetizedServersPage;
