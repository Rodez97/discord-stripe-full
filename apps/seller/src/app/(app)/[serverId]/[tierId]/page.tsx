import React from "react";
import EditTierForm from "../../../../components/EditTierForm";
import { getTier } from "lib/tier/getTier";
import { getGuildRoles } from "lib/guild/getGuildRoles";

async function EditProduct({
  params: { serverId, tierId },
}: {
  params: { serverId: string; tierId: string };
}) {
  const tier = await getTier(tierId);
  const roles = await getGuildRoles(serverId);

  if (!tier) {
    throw new Error("The tier does not exist.");
  }

  if (!roles) {
    throw new Error("There are no roles in the server.");
  }

  return <EditTierForm roles={roles} tier={tier} serverId={serverId} />;
}

export default EditProduct;
