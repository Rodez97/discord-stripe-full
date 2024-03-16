import React from "react";
import Link from "next/link";
import { Alert, AlertTitle, Button, Typography } from "@mui/material";
import TierCard from "../../../components/TierCard";
import Main from "@stripe-discord/ui/components/Main";
import CommonNavbar from "@stripe-discord/ui/components/CommonNavbar";
import Empty from "@stripe-discord/ui/components/Empty";
import CardsContainer from "@stripe-discord/ui/components/CardsContainer";
import { DiscordTierWithPrices } from "@stripe-discord/types";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import { getTiers } from "lib/tier/getTiers";

async function TiersPage({
  params: { serverId },
}: {
  params: { serverId: string };
}) {
  const tiers = await getTiers(serverId);

  if (!tiers) {
    throw new Error("The server does not exist.");
  }

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
