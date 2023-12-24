import NextAuth, { DefaultSession, User } from "next-auth";
import { JWT } from "@auth/core/jwt";
import { User } from "@auth/core/types";

declare module "next-auth" {
  interface Session {
    user: {
      /** The user's postal address. */
      id: string;
      accessToken: string;
      accessTokenExpires: number;
      refreshToken: string;
      subscription?: boolean;
    } & DefaultSession["user"];
  }
  interface Account {
    access_token: string;
    expires_in: number;
    refresh_token: string;
  }
}

declare module "@auth/core/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    subscriptionValidityExpires?: number;
    subscription?: boolean;
    refreshToken?: string;
    sub: string;
  }
}
