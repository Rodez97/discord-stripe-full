"use client";
import React from "react";
import NewTierForm from "../../../components/NewTierForm";
import useSWR, { Fetcher } from "swr";
import { mainFetcher } from "@stripe-discord/lib";
import ErrorPage from "../../error";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";

const fetcher: Fetcher<
  {
    roles: {
      id: string;
      name: string;
    }[];
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

function NewTier({ params: { serverId } }: { params: { serverId: string } }) {
  const { data, error, isLoading } = useSWR(
    `/api/tier/new-tier?guildId=${serverId}`,
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

  return <NewTierForm roles={data.roles} serverId={serverId} />;
}

export default NewTier;
