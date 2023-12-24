"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";
import Main from "@stripe-discord/ui/components/Main";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ErrorIcon from "@mui/icons-material/Error";

function SubscribeSuccess({
  searchParams,
}: {
  searchParams: { success: "true" | "false" };
}) {
  return (
    <Main>
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "100vh",
          gap: 2,
        }}
      >
        {searchParams.success === "true" ? (
          <CheckCircleIcon sx={{ fontSize: 100 }} color="success" />
        ) : (
          <ErrorIcon sx={{ fontSize: 100 }} color="error" />
        )}
        <Typography variant="h2">
          {searchParams.success === "true" ? "Success!" : "Cancelled!"}
        </Typography>
        <Typography variant="body1">
          {searchParams.success === "true"
            ? "You have successfully subscribed to the Discord Server!"
            : "You have cancelled the subscription process."}
        </Typography>

        <Button
          variant="contained"
          color="primary"
          href="/"
          sx={{
            mt: 2,
          }}
        >
          Go back to the home page
        </Button>
      </Box>
    </Main>
  );
}

export default SubscribeSuccess;
