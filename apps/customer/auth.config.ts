import DiscordProvider from "next-auth/providers/discord";
import { NextAuthConfig } from "next-auth";

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
      const { accessToken, sub, accessTokenExpires } = token;

      return {
        ...session,
        user: {
          ...session.user,
          id: sub,
          accessToken,
          accessTokenExpires,
        },
      };
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.accessTokenExpires = Date.now() + account.expires_in * 1000;
      }

      const accessTokenExpires = token.accessTokenExpires;

      // Return previous token if the access token has not expired yet
      if (accessTokenExpires && Date.now() < accessTokenExpires) {
        return token;
      }

      // Access token has expired, return null to sign out
      return null;
    },
  },
  trustHost: true,
} satisfies NextAuthConfig;
