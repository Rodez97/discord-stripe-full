import { UserRecord } from "firebase-admin/auth";

declare global {
  namespace Express {
    interface User extends UserRecord {
      accessToken: string;
      accessTokenExpires: Date;
      refreshToken: string;
      subscription: boolean;
    }
    interface JWT {
      accessToken: string;
      subscription: boolean;
      accessTokenExpires: Date;
      refreshToken: string;
    }
  }
}
