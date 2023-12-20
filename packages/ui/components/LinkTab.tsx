"use client";
import React from "react";
import Tab from "@mui/material/Tab";
import Link from "next/link";

interface LinkTabProps {
  label?: string;
  href?: string;
}

function LinkTab(props: LinkTabProps) {
  return <Tab LinkComponent={Link} {...props} />;
}

export default LinkTab;
