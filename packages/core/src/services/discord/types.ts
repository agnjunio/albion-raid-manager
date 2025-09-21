export type DiscordServiceOptions = {
  type?: "user" | "bot";
  token?: string;
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
