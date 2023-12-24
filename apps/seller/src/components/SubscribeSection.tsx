"use client";
import { Box, Button, Typography } from "@mui/material";
import React from "react";
import Link from "next/link";
import Image from "next/image";
import logoImg from "../../public/Logo/LogoWS.png";
import StarIcon from "@mui/icons-material/Star";

export default function SubscribeSection() {
  return (
    <Box
      sx={{
        height: "100%",
        gap: "2rem",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Image src={logoImg} alt="Logo" width={113.16 * 3} height={40 * 3} />
      <Typography
        variant="h5"
        sx={{
          color: "gray",
          textAlign: "center",
        }}
      >
        You need to be a subscriber to monetize servers on Discord.
      </Typography>

      <Button
        LinkComponent={Link}
        href="/subscribe"
        variant="contained"
        startIcon={<StarIcon />}
        size="large"
      >
        Get Started
      </Button>

      <Typography
        variant="caption"
        sx={{
          color: "gray",
          textAlign: "center",
        }}
      >
        * Try it free for 1 month, no credit card required.
      </Typography>
    </Box>
  );
}
