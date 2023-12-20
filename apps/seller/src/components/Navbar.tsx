"use client";
import React, { MouseEvent, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import AppBar from "@mui/material/AppBar";
import Box from "@mui/material/Box";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import Container from "@mui/material/Container";
import Avatar from "@mui/material/Avatar";
import Tooltip from "@mui/material/Tooltip";
import MenuItem from "@mui/material/MenuItem";
import { useSession } from "next-auth/react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCreditCard, faSignOut } from "@fortawesome/free-solid-svg-icons";
import { ListItemIcon, ListItemText } from "@mui/material";
import LoadingBackdrop from "@stripe-discord/ui/components/LoadingBackdrop";

function Navbar() {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [anchorElUser, setAnchorElUser] = useState<null | HTMLElement>(null);

  const handleOpenUserMenu = (event: MouseEvent<HTMLElement>) => {
    setAnchorElUser(event.currentTarget);
  };

  const handleCloseUserMenu = () => {
    setAnchorElUser(null);
  };

  return (
    <>
      <AppBar variant="elevation" position="static">
        <Container maxWidth="xl">
          <Toolbar disableGutters>
            <Box
              component={Link}
              href="/"
              sx={{
                display: "flex",
                alignItems: "center",
                textDecoration: "none",
                color: "inherit",
              }}
            >
              <Image
                src="/Logo/LogoWS.png"
                alt="Logo Discord + Stripe"
                width={113.16}
                height={40}
              />
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <Box sx={{ flexGrow: 0 }}>
              <Tooltip title="Open settings">
                <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                  <Avatar
                    alt={session?.user.name ?? "User"}
                    src={
                      session?.user.image ?? "https://via.placeholder.com/150"
                    }
                  />
                </IconButton>
              </Tooltip>
              <Menu
                sx={{ mt: "45px" }}
                id="menu-appbar"
                anchorEl={anchorElUser}
                anchorOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                keepMounted
                transformOrigin={{
                  vertical: "top",
                  horizontal: "right",
                }}
                open={Boolean(anchorElUser)}
                onClose={handleCloseUserMenu}
              >
                {Boolean(session?.user.subscription) && (
                  <form
                    action="/api/billing-portal"
                    method="GET"
                    onEnded={() => setLoading(false)}
                    onSubmit={() => setLoading(true)}
                  >
                    <MenuItem component="button" type="submit">
                      <ListItemIcon>
                        <FontAwesomeIcon icon={faCreditCard} />
                      </ListItemIcon>
                      <ListItemText>Manage Billing</ListItemText>
                    </MenuItem>
                  </form>
                )}

                <form action="/logout">
                  <MenuItem component="button" type="submit">
                    <ListItemIcon>
                      <FontAwesomeIcon icon={faSignOut} />
                    </ListItemIcon>
                    <ListItemText>Sign out</ListItemText>
                  </MenuItem>
                </form>
              </Menu>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <LoadingBackdrop open={loading} />
    </>
  );
}

export default Navbar;
