import DiscordProvider from "next-auth/providers/discord";
import { signOut } from "./auth";
import { NextAuthConfig } from "next-auth";
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
    signOut: "/logout",
  },
  callbacks: {
    authorized({ auth, request }) {
      const { nextUrl } = request;

      const loginPath = "/login";
      const isLoggedIn = !!auth?.user;
      const isOnLoginPage = nextUrl.pathname.startsWith(loginPath);
      let redirectTier = "";

      if (!isLoggedIn && nextUrl.pathname.match(/^\/tiers\/\w+/)) {
        redirectTier = nextUrl.pathname;
      }

      if (isLoggedIn && isOnLoginPage) {
        return Response.redirect(new URL("/", nextUrl));
      }

      if (isLoggedIn && !isOnLoginPage) {
        return true;
      }

      if (!isLoggedIn && isOnLoginPage) {
        return true;
      }

      if (!isLoggedIn && !isOnLoginPage) {
        if (redirectTier) {
          return Response.redirect(
            new URL(
              `/login?callbackUrl=${encodeURIComponent(redirectTier)}`,
              nextUrl
            )
          );
        } else {
          return false;
        }
      }

      return true;
    },
    async session({ session, token }) {
      const { accessToken, sub, accessTokenExpires, refreshToken } = token;

      return {
        ...session,
        user: {
          ...session.user,
          id: sub,
          accessToken,
          accessTokenExpires,
          refreshToken,
        },
      };
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;
        token.refreshToken = account.refresh_token;
      }

      const accessTokenExpires = token.accessTokenExpires;

      // Return previous token if the access token has not expired yet
      if (accessTokenExpires && Date.now() < accessTokenExpires) {
        return token;
      }

      // Access token has expired, try to update it
      return refreshAccessToken(token);
    },
  },
} satisfies NextAuthConfig;

async function refreshAccessToken(token: JWT): Promise<JWT> {
  try {
    if (!token.refreshToken) {
      // If there is no refresh token, sign out user and redirect to login page
      await signOut();

      return {
        ...token,
        error: "RefreshAccessTokenError",
      };
    }

    const url = "https://discord.com/api/v10/oauth2/token";

    const response = await fetch(url, {
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: "POST",
      body: new URLSearchParams({
        client_id: process.env.DISCORD_CLIENT_ID,
        client_secret: process.env.DISCORD_CLIENT_SECRET,
        grant_type: "refresh_token",
        refresh_token: token.refreshToken,
      }),
    });

    const refreshedTokens = await response.json();

    if (!response.ok) {
      throw refreshedTokens;
    }

    return {
      ...token,
      accessToken: refreshedTokens.access_token,
      accessTokenExpires: Date.now() + refreshedTokens.expires_in * 1000,
      refreshToken: refreshedTokens.refresh_token ?? token.refreshToken, // Fall back to old refresh token
    };
  } catch (error) {
    console.log(error);

    return {
      ...token,
      error: "RefreshAccessTokenError",
    };
  }
}
