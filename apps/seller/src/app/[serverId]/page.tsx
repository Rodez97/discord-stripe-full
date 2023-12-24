"use client";
import React from "react";
import Link from "next/link";
import { Button } from "@mui/material";
import TierCard from "../../components/TierCard";
import useSWR, { Fetcher } from "swr";
import { mainFetcher } from "@stripe-discord/lib";
import ErrorPage from "../error";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Empty from "@stripe-discord/ui/components/Empty";
import CardsContainer from "@stripe-discord/ui/components/CardsContainer";
import { DiscordTier, DiscordTierWithPrices } from "@stripe-discord/types";
import AddCircleIcon from "@mui/icons-material/AddCircle";

const fetcher: Fetcher<
  {
    tiers: DiscordTier[];
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

function TiersPage({ params: { serverId } }: { params: { serverId: string } }) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/guild?guildId=${serverId}`,
    fetcher
  );

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!data) {
    return <ErrorPage error={new Error("There was an error")} />;
  }

  const { tiers } = data;

  return (
    <Main>
      <CommonNavbar title="Manage tiers" backHref={`/`}>
        <Button
          LinkComponent={Link}
          href={`/${serverId}/new-tier`}
          variant="outlined"
          startIcon={<AddCircleIcon />}
          sx={{ width: 220 }}
        >
          Add a new tier
        </Button>
      </CommonNavbar>

      {tiers.length === 0 ? (
        <Empty variant="h5">No tiers found...</Empty>
      ) : (
        <CardsContainer>
          {tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier as DiscordTierWithPrices}
              mutate={mutate}
              serverId={serverId}
            />
          ))}
        </CardsContainer>
      )}
    </Main>
  );
}

export default TiersPage;
