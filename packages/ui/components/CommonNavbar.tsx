"use client";
import { Box, IconButton, Toolbar, Typography } from "@mui/material";
import Link from "next/link";
import React from "react";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

function CommonNavbar({
  title,
  backHref,
  children,
}: {
  title: string;
  backHref?: string;
  children?: React.ReactNode;
}) {
  return (
    <Box>
      <Toolbar
        sx={{
          padding: 0,
          m: 0,
          gap: 2,
          alignItems: "center",
          justifyContent: "center",
          marginBottom: children ? "0px" : "1rem",
        }}
      >
        {backHref && (
          <IconButton
            edge="start"
            color="inherit"
            LinkComponent={Link}
            href={backHref}
          >
            <FontAwesomeIcon icon={faArrowLeft} />
          </IconButton>
        )}
        <Typography
          variant="h5"
          component="h1"
          sx={{
            fontWeight: "bold",
          }}
          textAlign="center"
        >
          {title}
        </Typography>
      </Toolbar>

      {children && (
        <Toolbar
          sx={{
            padding: 0,
            m: 0,
            gap: 2,
            alignItems: "center",
            justifyContent: "center",

            "@media (max-width: 600px)": {
              flexDirection: "column",
            },
          }}
        >
          {children}
        </Toolbar>
      )}
    </Box>
  );
}

export default CommonNavbar;
