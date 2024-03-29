"use client";
import {
  Button,
  CardActionArea,
  CardHeader,
  CardMedia,
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
} from "@mui/material";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { MonetizedServer } from "@stripe-discord/types";
import MainCard from "@stripe-discord/ui/components/MainCard";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DeleteIcon from "@mui/icons-material/Delete";
import useGlobalElements from "@stripe-discord/ui/hooks/useGlobalElements";
import { deleteGuild } from "lib/guild/deleteGuild";

interface ServerCardProps {
  guild: MonetizedServer;
}

const ServerCard: React.FC<ServerCardProps> = ({ guild }) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const { openLoadingBackdrop, closeLoadingBackdrop, openSnackbar } =
    useGlobalElements();

  const handleMenuOpen = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleDeleteServer = async () => {
    handleMenuClose();
    setOpen(true);
  };

  const onAcceptDeleteServer = async () => {
    try {
      setOpen(false);

      openLoadingBackdrop();

      await deleteGuild(guild.id);
    } catch (error) {
      console.error(error);
      openSnackbar({
        message:
          error instanceof Error
            ? error.message
            : "There was an error deleting the server",
        severity: "error",
      });
    } finally {
      closeLoadingBackdrop();
    }
  };

  const handleConnectBot = async () => {
    const url = `https://discord.com/oauth2/authorize?client_id=${process.env.NEXT_PUBLIC_DISCORD_CLIENT_ID}&scope=bot&permissions=${process.env.NEXT_PUBLIC_DISCORD_PERMISSIONS}&guild_id=${guild.id}&disable_guild_select=true`;
    window.open(url, "_blank");
    handleMenuClose();
  };

  const handleCardClick = () => {
    router.push(`/${guild.id}`);
  };

  return (
    <>
      <MainCard variant="outlined">
        <CardActionArea onClick={handleCardClick} sx={{ paddingBottom: 3 }}>
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
            title={guild.name}
            titleTypographyProps={{ noWrap: true, width: 150 }}
          />
          <CardMedia
            sx={{ height: 100, backgroundSize: "contain" }}
            image={
              guild.icon
                ? `https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`
                : ""
            }
            title={guild.name}
            src={`https://cdn.discordapp.com/icons/${guild.id}/${guild.icon}.png`}
          />
        </CardActionArea>
      </MainCard>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <MenuItem onClick={handleConnectBot}>
          <ListItemIcon>
            <SmartToyIcon />
          </ListItemIcon>
          <ListItemText>Connect Bot</ListItemText>
        </MenuItem>
        <MenuItem onClick={handleDeleteServer}>
          <ListItemIcon color="red">
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
        <DialogTitle id="alert-dialog-title">Delete Server</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            {`Are you sure you want to delete ${guild.name}?`}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={onAcceptDeleteServer} autoFocus>
            Accept
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ServerCard;
