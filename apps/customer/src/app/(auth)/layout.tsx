"use client";
import { Box, Grid, Paper } from "@mui/material";
import React from "react";
import patternBg from "../../../public/images/pattern_background.png";
import logoImg from "../../../public/Logo/LogoWS.png";
import Image from "next/image";
import Copyright from "@stripe-discord/ui/components/Copyright";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          backgroundImage: `url(${patternBg.src})`,
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
        <Box
          sx={{
            mx: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: "100%",
          }}
        >
          <Image
            src={logoImg}
            alt="Logo"
            width={113.16 * 1.5}
            height={40 * 1.5}
          />
          {children}
          <Copyright sx={{ mt: 5 }} />
        </Box>
      </Grid>
    </Grid>
  );
}
