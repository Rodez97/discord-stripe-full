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
    } & DefaultSession["user"];
  }
  interface Account {
    access_token: string;
    expires_in: number;
  }
}

declare module "@auth/core/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT {
    accessToken?: string;
    accessTokenExpires?: number;
    sub: string;
  }
}
