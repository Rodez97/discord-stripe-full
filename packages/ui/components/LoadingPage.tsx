"use client";
import React from "react";
import { Box, CircularProgress } from "@mui/material";

function LoadingPage() {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
        flexGrow: 1,
      }}
    >
      <CircularProgress />
    </Box>
  );
}

export default LoadingPage;
