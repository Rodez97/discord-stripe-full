"use client";
import { Box, Button, Grid, Paper, Typography } from "@mui/material";
import Image from "next/image";
import React from "react";
import Copyright from "./Copyright";
import { signIn } from "next-auth/react";

function LoginPage({
  searchParams,
}: {
  searchParams?: { callbackUrl?: string };
}) {
  const handleSignIn = async () => {
    if (!searchParams?.callbackUrl) {
      await signIn("discord");
    } else {
      const decoded = decodeURIComponent(searchParams.callbackUrl);
      const redirectUrl = `${process.env.NEXT_PUBLIC_MAIN_URL}/${decoded}`;
      await signIn("discord", {
        redirectTo: redirectUrl,
        redirect: true,
      });
    }
  };

  return (
    <Grid container component="main" sx={{ height: "100vh" }}>
      <Grid
        item
        xs={false}
        sm={4}
        md={7}
        sx={{
          position: "relative",
        }}
      >
        <Image
          alt="Background Pattern"
          src="/images/pattern_background.png"
          quality={100}
          fill
          sizes="100%"
          style={{
            objectFit: "cover",
          }}
        />
      </Grid>
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
            src="/images/logo.png"
            alt="Logo"
            width={113.16 * 1.5}
            height={40 * 1.5}
          />
          <Typography component="h1" variant="h5" textAlign="center">
            Hi, welcome to Stripe + Discord!
          </Typography>
          <Box sx={{ mt: 1 }} action={handleSignIn} component="form">
            <Button
              fullWidth
              variant="contained"
              size="large"
              sx={{ mt: 3, mb: 2 }}
              type="submit"
            >
              Sign In with Discord
            </Button>
          </Box>
          <Copyright sx={{ mt: 5 }} />
        </Box>
      </Grid>
    </Grid>
  );
}

export default LoginPage;
