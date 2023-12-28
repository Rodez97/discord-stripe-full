"use client";
import React from "react";
import MenuItem from "@mui/material/MenuItem";
import { useSession } from "next-auth/react";
import { ListItemIcon, ListItemText } from "@mui/material";
import Navbar from "@stripe-discord/ui/components/Navbar";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";

function MainNavbar() {
  const { data: session } = useSession();
  const { openLoadingBackdrop, closeLoadingBackdrop } = useGlobalElements();

  return (
    <Navbar
      menuActions={
        Boolean(session?.user.subscription) && (
          <form
            action="/api/billing-portal"
            method="GET"
            onEnded={closeLoadingBackdrop}
            onSubmit={openLoadingBackdrop}
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
  );
}

export default MainNavbar;
