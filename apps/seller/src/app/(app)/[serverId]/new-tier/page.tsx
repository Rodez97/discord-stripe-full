import React from "react";
import NewTierForm from "../../../../components/NewTierForm";
import { getGuildRoles } from "lib/guild/getGuildRoles";

async function NewTier({
  params: { serverId },
}: {
  params: { serverId: string };
}) {
  const roles = await getGuildRoles(serverId);

  if (!roles) {
    throw new Error("The server does not exist.");
  }

  return <NewTierForm roles={roles} serverId={serverId} />;
}

export default NewTier;
