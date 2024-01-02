import type { NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";
import { JWT } from "@auth/core/jwt";

export const authConfig = {
  providers: [
    DiscordProvider({
      clientId: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      token: "https://discord.com/api/oauth2/token",
      userinfo: "https://discord.com/api/users/@me",
      authorization: {
        params: {
          scope: "identify email guilds",
        },
      },
    }),
  ],
  pages: {
    signIn: "/login",
  },
  callbacks: {
    authorized({ auth, request: { nextUrl } }) {
      const loginPath = "/login";
      const isLoggedIn = !!auth?.user;
      const pathname = nextUrl.pathname;
      const isSubscribed = Boolean(auth?.user?.subscription);
      const isOnApp = !nextUrl.pathname.startsWith(loginPath);
      if (isOnApp) {
        if (!isLoggedIn) return false;
      } else if (isLoggedIn) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (
        isLoggedIn &&
        !isSubscribed &&
        ![
          "/get-started",
          "/logout",
          "/subscribe",
          "/subscribe-success",
        ].includes(pathname)
      ) {
        return Response.redirect(new URL("/get-started", nextUrl));
      }

      if (
        isLoggedIn &&
        isSubscribed &&
        ["/get-started", "/subscribe"].includes(pathname)
      ) {
        return Response.redirect(new URL("/", nextUrl));
      }

      return true;
    },
    async session({ session, token }) {
      const { accessToken, sub, subscription } = token;

      return {
        ...session,
        user: {
          ...session.user,
          id: sub!,
          accessToken,
          subscription,
        },
      };
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;
      }

      const subscriptionValidityExpires = token.subscriptionValidityExpires;
      const accessTokenExpires = token.accessTokenExpires;

      if (
        !subscriptionValidityExpires ||
        Date.now() < subscriptionValidityExpires
      ) {
        token = await refreshSubscriptionStatus(token);
      }

      // Return previous token if the access token has not expired yet
      if (accessTokenExpires && Date.now() < accessTokenExpires) {
        return token;
      }

      // Access token has expired, return null to sign out
      return null;
    },
  },
} satisfies NextAuthConfig;

async function refreshSubscriptionStatus(token: JWT): Promise<JWT> {
  try {
    const response = await fetch(
      `${process.env.NEXTAUTH_URL}/api/verify-subscription`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ userId: token.sub }),
      }
    );

    const data = await response.json();

    if (!response.ok) {
      throw data;
    }

    return {
      ...token,
      subscription: data.isSub,
      subscriptionValidityExpires: Date.now() + 1000 * 60 * 60 * 24, // 24 hours
    };
  } catch (error) {
    console.log("Error refreshing subscription status:", error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
