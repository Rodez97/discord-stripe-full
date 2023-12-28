"use client";
import React from "react";
import AddServerForm from "../../../components/AddServerForm";
import useSWR, { Fetcher } from "swr";
import ErrorPage from "../../error";
import { mainFetcher } from "@stripe-discord/lib";
import LoadingPage from "@stripe-discord/ui/components/LoadingPage";

const fetcher: Fetcher<
  {
    availableServers: any[];
  },
  string
> = (apiUrl) => mainFetcher(apiUrl);

async function AddServer() {
  const { data, error, isLoading } = useSWR("/api/guild", fetcher);

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error) {
    return <ErrorPage error={error} />;
  }

  if (!data) {
    return <ErrorPage error={new Error("There was an error loading data")} />;
  }

  return <AddServerForm availableServers={data.availableServers} />;
}

export default AddServer;
