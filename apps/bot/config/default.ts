import { parseShardList, parseShardsTotal } from "./parsers";
import { Config } from "./types";

const config: Config = {
  bot: {
    shards: {
      total: parseShardsTotal(process.env.SHARDS_TOTAL),
      list: parseShardList(process.env.SHARDS_SPAWN),
    },
  },

  discord: {
    token: process.env.DISCORD_TOKEN,
  },

  logger: {
    level: "debug",
  },
};

export default config;
