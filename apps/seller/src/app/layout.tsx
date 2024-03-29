"use client";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "@mui/material/styles";
import { CssBaseline } from "@mui/material";
import Body from "@stripe-discord/ui/components/Body";
import { THEME } from "@stripe-discord/ui";
import GlobalElementsProvider from "@stripe-discord/ui/components/GlobalElementsProvider";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";

// Disable all logging in production
if (process.env.NEXT_PUBLIC_MODE === "production") {
  console.log = () => {};
  console.warn = () => {};
  console.error = () => {};
}

export default function RootLayout({
  // Layouts must accept a children prop.
  // This will be populated with nested layouts or pages
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content={THEME.palette.primary.main} />
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
        <AppRouterCacheProvider>
          <ThemeProvider theme={THEME}>
            <SessionProvider>
              <CssBaseline />
              <GlobalElementsProvider>{children}</GlobalElementsProvider>
            </SessionProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </Body>
    </html>
  );
}
