"use client";
import React, { useMemo, useState } from "react";
import useSWR, { Fetcher } from "swr";
import ErrorPage from "../../error";
import { Box, Container, Stack, Switch, Typography } from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DiscordTierWithPrices, MonetizedServer } from "@stripe-discord/types";
import { mainFetcher, controlledFetch } from "@stripe-discord/lib";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import PricingCard from "../../../components/PricingCard";
import Main from "@stripe-discord/ui/components/Main";
import pricingStyle from "../../../styles/pricing.module.scss";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";

const getCheckoutSessionUrl = (
  guildId: string,
  tierId: string,
  priceId: string
) =>
  `/api/checkout-session?guildId=${guildId}&tierId=${tierId}&priceId=${priceId}`;

const fetcher: Fetcher<
  {
    guild: MonetizedServer;
    tiers: DiscordTierWithPrices[];
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

function TiersPage({ params: { guildId } }: { params: { guildId: string } }) {
  const router = useRouter();
  const { data, error, isLoading } = useSWR(
    `/api/guild?guildId=${guildId}`,
    fetcher
  );
  const [yearly, setYearly] = useState(false);
  const { openLoadingBackdrop, closeLoadingBackdrop, openSnackbar } =
    useGlobalElements();

  const openCheckoutSession = (tierId: string, priceId: string) => async () => {
    const checkoutSessionUrl = getCheckoutSessionUrl(guildId, tierId, priceId);

    try {
      openLoadingBackdrop();

      const res = await controlledFetch(checkoutSessionUrl);

      const { url } = await res.json();
      router.push(url);
    } catch (error) {
      console.error(error);
      openSnackbar({
        message:
          error instanceof Error
            ? error.message
            : "There was an error creating the checkout session",
        severity: "error",
      });
    } finally {
      closeLoadingBackdrop();
    }
  };

  const haveYearlyPlan = useMemo(() => {
    if (!data?.tiers) {
      return false;
    }

    return data.tiers.some((tier) => tier.yearlyPriceId && tier.yearlyPriceQty);
  }, [data?.tiers, yearly]);

  const getPlans = useMemo(() => {
    if (!data?.tiers) {
      return [];
    }

    const sorter = (a: DiscordTierWithPrices, b: DiscordTierWithPrices) => {
      if (yearly && a.yearlyPriceQty && b.yearlyPriceQty) {
        return a.yearlyPriceQty - b.yearlyPriceQty;
      }

      return a.monthlyPriceQty - b.monthlyPriceQty;
    };

    if (!haveYearlyPlan || !yearly) {
      return data.tiers.sort(sorter);
    }

    return data.tiers.filter((tier) => tier.yearlyPriceId).sort(sorter);
  }, [data?.tiers, yearly, haveYearlyPlan]);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100vh",
        }}
      >
        <LoadingPage />
      </Box>
    );
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!data) {
    return <ErrorPage error={new Error("There was an error")} />;
  }

  const { guild } = data;

  return (
    <Main>
      <Container disableGutters maxWidth="sm" sx={{ pt: 8, pb: 6 }}>
        <Box
          sx={{
            mb: 2,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: "1rem",
          }}
        >
          {guild.icon && (
            <Image
              src={
                guild.icon
                  ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                  : "/images/discord-logo.png"
              }
              alt={guild.name}
              width={50}
              height={50}
              layout="fixed"
            />
          )}

          <Typography variant="h4" align="center">
            {guild.name}
          </Typography>
        </Box>

        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          component="p"
        >
          Choose a plan that suits your needs
        </Typography>
      </Container>

      <Box
        sx={{
          maxWidth: 1000,
          margin: "auto",
          width: "100%",
          height: "100%",
          overflow: "hidden",
        }}
      >
        {haveYearlyPlan && (
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            justifyContent="center"
            mb={2}
          >
            <Typography>Monthly</Typography>
            <Switch
              inputProps={{ "aria-label": "Recurrence" }}
              checked={yearly}
              onChange={(event) => setYearly(event.target.checked)}
            />
            <Typography>Yearly</Typography>
          </Stack>
        )}

        <div className={pricingStyle.planItem__container}>
          {getPlans.map((tier) => {
            return (
              // Enterprise card is full width at sm breakpoint
              <PricingCard
                key={tier.id}
                tier={tier}
                numberOfTiers={getPlans.length}
                yearly={yearly}
                openCheckoutSession={openCheckoutSession}
              />
            );
          })}
        </div>
      </Box>
    </Main>
  );
}

export default TiersPage;
