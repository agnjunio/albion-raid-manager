import { User } from "@albion-raid-manager/core/types";

// Request types
export interface DiscordCallbackRequest {
  code: string;
  redirectUri: string;
}

// Response types
export type GetMeResponse = { user: User };
export type CallbackResponse = void;
export type LogoutResponse = void;
