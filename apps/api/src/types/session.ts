import { User } from "../../../../packages/core/src/types.bkp";

declare module "express-session" {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user?: User;
  }
}
