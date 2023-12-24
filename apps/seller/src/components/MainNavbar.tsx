"use client";
import React, { useState } from "react";
import MenuItem from "@mui/material/MenuItem";
import { useSession } from "next-auth/react";
import { ListItemIcon, ListItemText } from "@mui/material";
import LoadingBackdrop from "@stripe-discord/ui/components/LoadingBackdrop";
import Navbar from "@stripe-discord/ui/components/Navbar";
import CreditCardIcon from "@mui/icons-material/CreditCard";

function MainNavbar() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);

  return (
    <>
      <Navbar
        menuActions={
          Boolean(session?.user.subscription) && (
            <form
              action="/api/billing-portal"
              method="GET"
              onEnded={() => setLoading(false)}
              onSubmit={() => setLoading(true)}
            >
              <MenuItem component="button" type="submit">
                <ListItemIcon>
                  <CreditCardIcon />
                </ListItemIcon>
                <ListItemText>Manage Billing</ListItemText>
              </MenuItem>
            </form>
          )
        }
      />
      <LoadingBackdrop open={loading} />
    </>
  );
}

export default MainNavbar;
