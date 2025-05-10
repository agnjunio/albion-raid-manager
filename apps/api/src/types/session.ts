declare module "express-session" {
  interface SessionData {
    accessToken?: string;
    refreshToken?: string;
    error?: string;
  }
}
