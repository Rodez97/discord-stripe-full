"use client";
import React, { useMemo, useState } from "react";
import useSWR, { Fetcher } from "swr";
import ErrorPage from "../../error";
import {
  Alert,
  Box,
  Collapse,
  Container,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { DiscordTierWithPrices, MonetizedServer } from "@stripe-discord/types";
import { mainFetcher, controlledFetch } from "@stripe-discord/lib";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import LoadingBackdrop from "@stripe-discord/ui/components/LoadingBackdrop";
import CloseIcon from "@mui/icons-material/Close";
import PricingCard from "../../../components/PricingCard";
import Main from "@stripe-discord/ui/components/Main";
import pricingStyle from "../../../styles/pricing.module.scss";

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
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [yearly, setYearly] = useState(false);

  const openCheckoutSession = (tierId: string, priceId: string) => async () => {
    const checkoutSessionUrl = getCheckoutSessionUrl(guildId, tierId, priceId);

    try {
      setLoading(true);
      const res = await controlledFetch(checkoutSessionUrl);

      const { url } = await res.json();
      router.push(url);
    } catch (error) {
      console.error(error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("There was an error");
      }
    } finally {
      setLoading(false);
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

      <Collapse
        in={Boolean(errorMessage)}
        sx={{
          marginTop: "2rem",
          marginX: "auto",
          maxWidth: 400,
        }}
      >
        <Alert
          severity="error"
          action={
            <IconButton
              aria-label="close"
              color="inherit"
              size="small"
              onClick={() => {
                setErrorMessage("");
              }}
            >
              <CloseIcon fontSize="inherit" />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {errorMessage}
        </Alert>
      </Collapse>

      <LoadingBackdrop open={loading} />
    </Main>
  );
}

export default TiersPage;
