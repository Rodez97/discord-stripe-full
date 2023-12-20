"use client";
import React from "react";
import StripeSettingsForm from "../../../components/StripeSettingsForm";
import useSWR, { Fetcher } from "swr";
import ErrorPage from "../../error";
import { mainFetcher } from "@stripe-discord/lib";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import { StripeKeys } from "@stripe-discord/types";

const fetcher: Fetcher<
  {
    settings: StripeKeys;
    webhookUrl: string;
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

async function StripeSettingsPage() {
  const { data, error, isLoading, mutate } = useSWR("/settings/api", fetcher);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!data) {
    return (
      <ErrorPage error={new Error("There was an error loading settings")} />
    );
  }

  return (
    <StripeSettingsForm
      settings={data.settings}
      mutate={mutate}
      webhookUrl={data.webhookUrl}
    />
  );
}

export default StripeSettingsPage;
