"use client";
import { Backdrop, CircularProgress } from "@mui/material";
import React from "react";

function LoadingBackdrop({ open }: { open: boolean }) {
  return (
    <Backdrop
      sx={{ color: "#fff", zIndex: (theme) => theme.zIndex.modal + 1 }}
      open={open}
    >
      <CircularProgress color="inherit" />
    </Backdrop>
  );
}

export default LoadingBackdrop;
