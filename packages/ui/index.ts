"use client";

import { createTheme } from "@mui/material";

// @index('./**/*.tsx', f => `export * from '${f.path}'`)
export * from "./components/Body";
export * from "./components/CardsContainer";
export * from "./components/CommonNavbar";
export * from "./components/Copyright";
export * from "./components/Empty";
export * from "./components/ErrorPage";
export * from "./components/Form";
export * from "./components/FormContainer";
export * from "./components/LinkTab";
export * from "./components/LoadingBackdrop";
export * from "./components/LoadingPage";
export * from "./components/LoginPage";
export * from "./components/Main";
export * from "./components/MainCard";
export * from "./components/Navbar";
// @endindex

export const THEME = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
});
