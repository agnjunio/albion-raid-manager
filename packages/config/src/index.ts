import z from "zod";
import { parseBool, parseShardList, parseShardsTotal } from "./parsers";

const schema = z.object({
  bot: z.object({
    shards: z.object({
      total: z.custom<number | "auto">(parseShardsTotal).optional(),
      list: z.custom<number[] | "auto">(parseShardList).optional(),
    }),
  }),

  discord: z.object({
    token: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
  }),

  logger: z.object({
    level: z.enum(["debug", "verbose", "info", "warn", "error"]),
    pretty: z.any().optional().transform(parseBool),
    files: z.any().optional().transform(parseBool),
  }),
});

const isProd = process.env.NODE_ENV === "production";
const config = schema.safeParse({
  bot: {
    shards: {
      total: process.env.SHARDS_TOTAL,
      list: process.env.SHARDS_SPAWN,
    },
  },

  discord: {
    token: process.env.DISCORD_TOKEN,
    clientId: process.env.DISCORD_CLIENT_ID,
    clientSecret: process.env.DISCORD_CLIENT_SECRET,
  },

  logger: {
    level: process.env.LOGGER_LEVEL ?? (isProd ? "info" : "debug"),
    pretty: process.env.LOGGER_PRETTY ?? !isProd,
    files: process.env.LOGGER_FILES ?? isProd,
  },
});

if (!config.success) {
  // eslint-disable-next-line no-console
  console.error("❌ Invalid configuration:", config.error.issues);
  process.exit(1);
}

export default config.data;
