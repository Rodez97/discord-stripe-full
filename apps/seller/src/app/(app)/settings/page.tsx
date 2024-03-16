import React from "react";
import StripeSettingsForm from "../../../components/StripeSettingsForm";
import { getSettings } from "lib/settings/getSettings";

async function StripeSettingsPage() {
  const settings = await getSettings();

  return <StripeSettingsForm settings={settings} />;
}

export default StripeSettingsPage;
