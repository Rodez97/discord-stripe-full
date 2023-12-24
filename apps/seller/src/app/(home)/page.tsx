"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@mui/material";
import ServerCard from "../../components/ServerCard";
import useSWR, { Fetcher } from "swr";
import { mainFetcher } from "@stripe-discord/lib";
import ErrorPage from "../error";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Empty from "@stripe-discord/ui/components/Empty";
import CardsContainer from "@stripe-discord/ui/components/CardsContainer";
import { MonetizedServer } from "@stripe-discord/types";
import SettingsIcon from "@mui/icons-material/Settings";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const fetcher: Fetcher<
  {
    guilds: MonetizedServer[];
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

function MonetizedServersPage() {
  const { data, error, isLoading, mutate } = useSWR(
    "/api/monetized-servers",
    fetcher
  );

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
      <CommonNavbar title={`Monetized servers (${guilds.length}/10)`}>
        <Button
          LinkComponent={Link}
          href="/settings"
          startIcon={<SettingsIcon />}
          variant="outlined"
          sx={{ width: 220 }}
        >
          Stripe settings
        </Button>
        <Button
          LinkComponent={Link}
          href="/add-server"
          startIcon={<AddCircleIcon />}
          variant="outlined"
          sx={{ width: 220 }}
          disabled={guilds.length >= 10}
        >
          Connect a server
        </Button>
      </CommonNavbar>

      {guilds.length === 0 ? (
        <Empty variant="body1">No monetized servers yet...</Empty>
      ) : (
        <CardsContainer>
          {guilds.map((guild) => (
            <ServerCard key={guild.id} guild={guild} mutate={mutate} />
          ))}
        </CardsContainer>
      )}
    </Main>
  );
}

export default MonetizedServersPage;
