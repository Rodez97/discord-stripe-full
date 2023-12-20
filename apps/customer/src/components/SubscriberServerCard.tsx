"use client";
import {
  faEllipsisVertical,
  faMoneyBill,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  CardActions,
  CardContent,
  CardMedia,
  Chip,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { faDiscord } from "@fortawesome/free-brands-svg-icons";
import { useRouter } from "next/navigation";
import MainCard from "@stripe-discord/ui/components/MainCard";
import { UserSubscription } from "@stripe-discord/types";
import LoadingBackdrop from "@stripe-discord/ui/components/LoadingBackdrop";

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
      await fetch(`/subscribed/api`, {
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
      const res = await fetch(
        `/api/customer-billing-portal?guildId=${guild.guildId}`
      );

      if (!res.ok) {
        throw new Error(res.statusText);
      }

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
      <MainCard
        sx={{
          width: 220,
          paddingTop: "1rem",
        }}
        variant="outlined"
      >
        <CardMedia
          sx={{ height: 100, backgroundSize: "contain" }}
          image={`https://cdn.discordapp.com/icons/${guild.guildId}/${guild.guildIcon}.png`}
          title={guild.guildName}
        />
        <CardContent>
          <Typography
            gutterBottom
            variant="h6"
            component="div"
            textAlign="center"
          >
            {guild.guildName}
          </Typography>
        </CardContent>
        <CardActions disableSpacing>
          <Chip label={guild.subscriptionStatus} color="primary" />

          <IconButton
            onClick={handleMenuOpen}
            aria-label="settings"
            aria-controls="settings-menu"
            aria-haspopup="true"
            aria-expanded={Boolean(anchorEl)}
            sx={{ ml: "auto" }}
          >
            <FontAwesomeIcon icon={faEllipsisVertical} />
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem
              onClick={joinDiscordServer}
              disabled={["active", "trialing"].includes(
                guild.subscriptionStatus
              )}
            >
              <ListItemIcon>
                <FontAwesomeIcon icon={faDiscord} />
              </ListItemIcon>
              <ListItemText>Join Discord Server</ListItemText>
            </MenuItem>
            <MenuItem onClick={manageSubscription}>
              <ListItemIcon>
                <FontAwesomeIcon icon={faMoneyBill} />
              </ListItemIcon>
              <ListItemText>Manage Subscription</ListItemText>
            </MenuItem>
          </Menu>
        </CardActions>
      </MainCard>

      <LoadingBackdrop open={loading} />
    </>
  );
};

export default SubscriberServerCard;
