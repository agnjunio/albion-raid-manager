export * from "discord-api-types/v10";

export type DiscordServiceOptions = {
  authorization?: string;
};

export interface DiscordAccessToken {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
}

export enum ChannelType {
  TEXT = 0,
}

export interface Channel {
  id: string;
  name: string;
  type: ChannelType;
  parentId?: string;
}
