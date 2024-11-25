export interface Config {
  bot?: {
    shards?: {
      total?: number | "auto";
      list?: number[] | "auto";
    };
  };

  discord?: {
    token?: string;
  };

  logger?: {
    level?: string;
  };

  purge?: {
    channelId: string;
    timeout: number;
    pinned?: boolean;
    exceptions?: {
      type: "message" | "user" | "role";
      id: string;
    }[];
  }[];
}

export type BotConfig = Config["bot"];
export type DiscordConfig = Config["discord"];
export type LoggerConfig = Config["logger"];
export type PurgeConfig = Config["purge"];
