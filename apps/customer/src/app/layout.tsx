"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeOptions, ThemeProvider, createTheme } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Body from "@stripe-discord/ui/components/Body";

export const themeOptions: ThemeOptions = {
  palette: {
    mode: "dark",
    primary: {
      main: "#3f51b5",
    },
    secondary: {
      main: "#f50057",
    },
  },
};

const theme = createTheme(themeOptions);

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <html lang="en">
        <head>
          <meta charSet="utf-8" />
          <meta name="theme-color" content={theme.palette.primary.main} />
          <meta name="viewport" content="initial-scale=1, width=device-width" />
          <title>{process.env.NEXT_PUBLIC_SITE_NAME}</title>
          <meta
            name="description"
            content="Connect your Discord server to Stripe and start accepting payments."
          />
          <meta
            name="keywords"
            content="discord, stripe, discord stripe, discord stripe bot, discord bot, stripe bot"
          />
        </head>
        <Body>
          <SessionProvider>
            <CssBaseline />
            {children}
          </SessionProvider>
        </Body>
      </html>
    </ThemeProvider>
  );
}
