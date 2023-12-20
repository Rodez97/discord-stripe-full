"use client";
import * as React from "react";
import Link from "@mui/material/Link";
import Typography from "@mui/material/Typography";

const Copyright = (props: any) => {
  return (
    <Typography
      variant="body2"
      color="text.secondary"
      align="center"
      {...props}
    >
      {"Copyright © "}
      <Link color="inherit" href={process.env.NEXT_PUBLIC_MAIN_URL}>
        {process.env.NEXT_PUBLIC_SITE_NAME}
      </Link>{" "}
      {new Date().getFullYear()}
      {"."}
    </Typography>
  );
};

export default Copyright;
