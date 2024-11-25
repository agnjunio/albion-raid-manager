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
}

export type BotConfig = Config["bot"];
export type DiscordConfig = Config["discord"];
export type LoggerConfig = Config["logger"];
