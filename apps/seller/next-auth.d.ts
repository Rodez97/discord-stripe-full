import type { DefaultJWT } from "@auth/core/jwt";
import NextAuth, { DefaultSession } from "next-auth";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's postal address. */
      id: string;
      accessToken: string;
      accessTokenExpires: Date;
      refreshToken: string;
      subscription?: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  interface JWT extends DefaultJWT {
    accessToken?: string;
    accessTokenExpires: Date;
    refreshToken: string;
  }
}
