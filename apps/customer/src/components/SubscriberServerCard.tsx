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
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import MainCard from "@stripe-discord/ui/components/MainCard";
import { UserSubscription } from "@stripe-discord/types";
import LoadingBackdrop from "@stripe-discord/ui/components/LoadingBackdrop";
import HailIcon from "@mui/icons-material/Hail";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import { controlledFetch } from "@stripe-discord/lib";

interface SubscriberServerCardProps {
  guild: UserSubscription;
}

const SubscriberServerCard: React.FC<SubscriberServerCardProps> = ({
  guild,
}) => {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [loading, setLoading] = useState(false);

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const joinDiscordServer = async () => {
    try {
      setLoading(true);
      await controlledFetch(`/api/subscribed`, {
        method: "POST",
        body: JSON.stringify({ guildId: guild.guildId }),
      });

      handleMenuClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const manageSubscription = async () => {
    try {
      setLoading(true);
      const res = await controlledFetch(
        `/api/customer-billing-portal?guildId=${guild.guildId}`
      );

      const { url } = await res.json();
      router.push(url);
      handleMenuClose();
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
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
          disabled={["active", "trialing"].includes(guild.subscriptionStatus)}
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

      <LoadingBackdrop open={loading} />
    </>
  );
};

export default SubscriberServerCard;
