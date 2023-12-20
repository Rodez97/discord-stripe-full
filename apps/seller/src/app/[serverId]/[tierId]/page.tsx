"use client";
import React from "react";
import EditTierForm from "../../../components/EditTierForm";
import useSWR, { Fetcher } from "swr";
import { mainFetcher } from "@stripe-discord/lib";
import ErrorPage from "../../error";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";
import { DiscordTier } from "@stripe-discord/types";

const fetcher: Fetcher<
  {
    roles: {
      id: string;
      name: string;
    }[];
    tier: DiscordTier;
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

function EditProduct({
  params: { serverId, tierId },
}: {
  params: { serverId: string; tierId: string };
}) {
  const { data, error, isLoading } = useSWR(
    `/api/tier/update-tier?guildId=${serverId}&tierId=${tierId}`,
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

  return (
    <EditTierForm roles={data.roles} tier={data.tier} serverId={serverId} />
  );
}

export default EditProduct;
