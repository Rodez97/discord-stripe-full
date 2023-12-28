"use client";
import {
  CardActions,
  CardHeader,
  CardMedia,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
} from "@mui/material";
import React from "react";
import { useRouter } from "next/navigation";
import MainCard from "@stripe-discord/ui/components/MainCard";
import { UserSubscription } from "@stripe-discord/types";
import HailIcon from "@mui/icons-material/Hail";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { controlledFetch } from "@stripe-discord/lib";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";

interface SubscriberServerCardProps {
  guild: UserSubscription;
}

const SubscriberServerCard: React.FC<SubscriberServerCardProps> = ({
  guild,
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { openLoadingBackdrop, closeLoadingBackdrop, openSnackbar } =
    useGlobalElements();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const joinDiscordServer = async () => {
    try {
      openLoadingBackdrop();

      await controlledFetch(`/api/subscribed`, {
        method: "POST",
        body: JSON.stringify({ guildId: guild.guildId }),
      });

      handleMenuClose();
    } catch (error) {
      console.error(error);
      openSnackbar({
        message:
          error instanceof Error
            ? error.message
            : "There was an error joining the server",
        severity: "error",
      });
    } finally {
      closeLoadingBackdrop();
    }
  };

  const manageSubscription = async () => {
    try {
      openLoadingBackdrop();

      const res = await controlledFetch(
        `/api/customer-billing-portal?guildId=${guild.guildId}`
      );

      const { url } = await res.json();
      router.push(url);
      handleMenuClose();
    } catch (error) {
      console.error(error);
      openSnackbar({
        message:
          error instanceof Error
            ? error.message
            : "There was an error creating the billing portal session",
        severity: "error",
      });
    } finally {
      closeLoadingBackdrop();
    }
  };

  return (
    <>
      <MainCard variant="outlined">
        <CardHeader
          action={
            <IconButton
              onClick={handleMenuOpen}
              aria-label="settings"
              aria-controls="settings-menu"
              aria-haspopup="true"
              aria-expanded={Boolean(anchorEl)}
              sx={{ ml: "auto" }}
            >
              <MoreVertIcon />
            </IconButton>
          }
          title={guild.guildName}
        />
        <CardMedia
          sx={{ height: 100, backgroundSize: "contain" }}
          image={
            guild.guildIcon
              ? `https://cdn.discordapp.com/icons/${guild.guildId}/${guild.guildIcon}.png`
              : "/images/discord-logo.png"
          }
          title={guild.guildName}
        />
        <CardActions>
          <Chip label={guild.subscriptionStatus} color="primary" />
        </CardActions>
      </MainCard>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem
          onClick={joinDiscordServer}
          disabled={!["active", "trialing"].includes(guild.subscriptionStatus)}
        >
          <ListItemIcon>
            <HailIcon />
          </ListItemIcon>
          <ListItemText>Join Discord Server</ListItemText>
        </MenuItem>
        <MenuItem onClick={manageSubscription}>
          <ListItemIcon>
            <CreditCardIcon />
          </ListItemIcon>
          <ListItemText>Manage Subscription</ListItemText>
        </MenuItem>
      </Menu>
    </>
  );
};

export default SubscriberServerCard;
