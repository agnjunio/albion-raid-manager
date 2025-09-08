import { User } from "@albion-raid-manager/types";

declare module "express-session" {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
    user?: User;
  }
}
