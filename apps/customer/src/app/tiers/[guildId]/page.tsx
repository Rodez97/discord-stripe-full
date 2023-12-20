"use client";
import React, { useMemo, useState } from "react";
import useSWR, { Fetcher } from "swr";
import ErrorPage from "../../error";
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Collapse,
  Container,
  CssBaseline,
  GlobalStyles,
  Grid,
  IconButton,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import Image from "next/image";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faClose } from "@fortawesome/free-solid-svg-icons";
import { useRouter } from "next/navigation";
import { DiscordTierWithPrices, MonetizedServer } from "@stripe-discord/types";
import { mainFetcher } from "@stripe-discord/lib";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import LoadingBackdrop from "@stripe-discord/ui/components/LoadingBackdrop";

const getCheckoutSessionUrl = (
  guildId: string,
  tierId: string,
  priceId: string
) =>
  `/api/checkout-session?guildId=${guildId}&tierId=${tierId}&priceId=${priceId}`;

const convertPrice = (price: number, currency: string) =>
  Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
  }).format(price);

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
      const res = await fetch(checkoutSessionUrl);
      if (!res.ok) {
        throw new Error(res.statusText);
      }
      const { url } = await res.json();
      if (!url) {
        throw new Error("There was an error");
      }
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
    <Box>
      <GlobalStyles
        styles={{ ul: { margin: 0, padding: 0, listStyle: "none" } }}
      />
      <CssBaseline />

      <Container
        disableGutters
        maxWidth="sm"
        component="main"
        sx={{ pt: 8, pb: 6 }}
      >
        {guild.icon && (
          <Image
            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
            alt={guild.name}
            width={64}
            height={64}
            layout="fixed"
            style={{
              margin: "0 auto",
              display: "block",
              marginBottom: "1rem",
            }}
          />
        )}
        <Typography
          component="h1"
          variant="h2"
          align="center"
          color="text.primary"
          gutterBottom
        >
          {guild.name}
        </Typography>
        <Typography
          variant="h5"
          align="center"
          color="text.secondary"
          component="p"
        >
          Choose a plan that suits your needs and begin to experience the
          advantages of being a supporter of <b>{guild.name}</b>.
        </Typography>
      </Container>

      {/* End hero unit */}
      <Container maxWidth="md" component="main">
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

        <Grid container spacing={5} alignItems="flex-end">
          {getPlans.map((tier) => {
            return (
              // Enterprise card is full width at sm breakpoint
              <Grid
                item
                key={tier.nickname}
                xs={12}
                sm={getPlans.length === 1 ? 12 : 6}
                md={
                  getPlans.length === 1
                    ? 12
                    : getPlans.length === 2
                    ? 6
                    : getPlans.length === 3
                    ? 4
                    : 3
                }
              >
                <Card
                  sx={{
                    boxShadow: 2,
                    transition: "box-shadow 0.3s ease-in-out",
                    "&:hover": {
                      boxShadow: 4,
                    },
                    maxWidth: 345,
                    margin: "0 auto",
                  }}
                >
                  <CardHeader
                    title={tier.nickname}
                    titleTypographyProps={{ align: "center" }}
                    subheaderTypographyProps={{
                      align: "center",
                    }}
                    sx={{
                      backgroundColor: (theme) =>
                        theme.palette.mode === "light"
                          ? theme.palette.grey[200]
                          : theme.palette.grey[700],
                    }}
                  />
                  <CardContent>
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "baseline",
                        mb: 2,
                      }}
                    >
                      <Typography
                        component="h2"
                        variant="h3"
                        color="text.primary"
                      >
                        {convertPrice(
                          yearly && tier.yearlyPriceQty
                            ? tier.yearlyPriceQty
                            : tier.monthlyPriceQty,
                          tier.currency
                        )}
                      </Typography>
                      <Typography variant="h6" color="text.secondary">
                        /{yearly ? "yr" : "mo"}
                      </Typography>
                    </Box>

                    {tier.description && (
                      <Typography variant="subtitle1" align="center">
                        {tier.description}
                      </Typography>
                    )}
                  </CardContent>
                  <CardActions>
                    <Button
                      fullWidth
                      variant={"contained"}
                      onClick={openCheckoutSession(
                        tier.id,
                        yearly && tier.yearlyPriceId
                          ? tier.yearlyPriceId
                          : tier.monthlyPriceId
                      )}
                    >
                      Get started
                    </Button>
                  </CardActions>
                </Card>
              </Grid>
            );
          })}
        </Grid>
      </Container>

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
              <FontAwesomeIcon icon={faClose} />
            </IconButton>
          }
          sx={{ mb: 2 }}
        >
          {errorMessage}
        </Alert>
      </Collapse>

      <LoadingBackdrop open={loading} />
    </Box>
  );
}

export default TiersPage;
