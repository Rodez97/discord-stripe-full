"use client";
import React from "react";
import Link from "next/link";
import { Alert, AlertTitle, Button, Typography } from "@mui/material";
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
    `/api/guild/${serverId}`,
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
        <>
          <Alert
            severity="info"
            variant="outlined"
            sx={{
              maxWidth: 600,
              margin: "auto",
            }}
            action={
              <Button
                color="inherit"
                size="small"
                href={`${process.env.NEXT_PUBLIC_CUSTOMER_URL}/tiers/${serverId}`}
                target="_blank"
              >
                Visit
              </Button>
            }
          >
            <AlertTitle>Seller page url for this server:</AlertTitle>
            <Typography
              noWrap
            >{`${process.env.NEXT_PUBLIC_CUSTOMER_URL}/tiers/${serverId}`}</Typography>
          </Alert>
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
        </>
      )}
    </Main>
  );
}

export default TiersPage;
