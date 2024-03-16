import React from "react";
import AddServerForm from "../../../components/AddServerForm";
import { getAvailableGuilds } from "lib/guild/getAvailableGuilds";

async function AddServer() {
  const availableGuilds = await getAvailableGuilds();

  if (!availableGuilds) {
    throw new Error("There was an error getting the available servers.");
  }

  return <AddServerForm availableServers={availableGuilds} />;
}

export default AddServer;
