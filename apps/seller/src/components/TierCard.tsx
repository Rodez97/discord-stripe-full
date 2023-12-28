"use client";
import {
  Button,
  CardContent,
  CardHeader,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Typography,
} from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { KeyedMutator } from "swr";
import { DiscordTier, DiscordTierWithPrices } from "@stripe-discord/types";
import MainCard from "@stripe-discord/ui/components/MainCard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";

interface TierCardProps {
  tier: DiscordTierWithPrices;
  serverId: string;
  mutate: KeyedMutator<{
    tiers: DiscordTier[];
  }>;
}

const TierCard: React.FC<TierCardProps> = ({ tier, serverId, mutate }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { openLoadingBackdrop, closeLoadingBackdrop, openSnackbar } =
    useGlobalElements();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleEditTier = () => {
    router.push(`/${serverId}/${tier.id}`);
  };

  const handleDelete = () => {
    handleMenuClose();
    setOpen(true);
  };

  const onAcceptDeleteTier = async () => {
    try {
      setOpen(false);

      openLoadingBackdrop();

      await fetch(`/api/tier`, {
        method: "DELETE",
        body: JSON.stringify({ tierId: tier.id }),
      });

      mutate((prev) => {
        if (!prev) {
          return prev;
        }
        return {
          tiers: prev.tiers.filter((t) => t.id !== tier.id),
        };
      });
    } catch (error) {
      console.error(error);
      openSnackbar({
        message:
          error instanceof Error
            ? error.message
            : "There was an error deleting the tier",
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
          titleTypographyProps={{ variant: "h6" }}
          title={tier.nickname}
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
        />

        <CardContent>
          <Typography gutterBottom>
            {Intl.NumberFormat("en-US", {
              style: "currency",
              currency: tier.currency,
            }).format(tier.monthlyPriceQty)}{" "}
            <Typography
              component="span"
              textAlign="center"
              color="text.secondary"
            >
              / month
            </Typography>
          </Typography>

          {tier.yearlyPriceQty && tier.yearlyPriceId && (
            <Typography gutterBottom>
              {Intl.NumberFormat("en-US", {
                style: "currency",
                currency: tier.currency,
              }).format(tier.yearlyPriceQty)}{" "}
              <Typography
                component="span"
                textAlign="center"
                color="text.secondary"
              >
                / year
              </Typography>
            </Typography>
          )}
        </CardContent>
      </MainCard>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleEditTier}>
          <ListItemIcon>
            <EditIcon />
          </ListItemIcon>
          <ListItemText>Edit Tier</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDelete}>
          <ListItemIcon>
            <DeleteIcon color="error" />
          </ListItemIcon>
          <ListItemText sx={{ color: "red" }}>Remove</ListItemText>
        </MenuItem>
      </Menu>

      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">Delete Tier</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`Are you sure you want to delete this tier?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onAcceptDeleteTier} autoFocus>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default TierCard;
