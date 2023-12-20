"use client";
import React from "react";
import { Box, Button, Typography } from "@mui/material";

function SubscribeSuccess({
  searchParams,
}: {
  searchParams: { success: "true" | "false" };
}) {
  if (searchParams.success === "true") {
    // Create a success page
    return (
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
        <Typography variant="h1">Success!</Typography>
        <Typography variant="body1">
          You have successfully subscribed to the Discord Server!
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
    );
  } else {
    return (
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
        <Typography variant="h1">Cancelled!</Typography>
        <Typography variant="body1">
          You have cancelled the subscription process.
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
    );
  }
}

export default SubscribeSuccess;
