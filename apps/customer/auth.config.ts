import type { NextAuthConfig } from "next-auth";
import DiscordProvider from "next-auth/providers/discord";

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
      const { accessToken, sub: userId } = token;

      if (!userId) {
        throw new Error("No user ID found");
      }

      const newSessionObject = {
        ...session,
        user: {
          ...session.user,
          id: userId,
          accessToken,
        },
      };

      return newSessionObject;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
      }
      return token;
    },
  },
} satisfies NextAuthConfig;
