import { z } from "zod";

import { parseBool, parseShardList, parseShardsTotal } from "./parsers";

export const schema = z.object({
  service: z.object({
    name: z.string(),
  }),

  api: z.object({
    port: z.coerce.number().default(3000),
    cors: z.object({
      origin: z.string(),
    }),
  }),

  bot: z.object({
    shards: z.object({
      total: z.custom<number | "auto">(parseShardsTotal).optional(),
      list: z.custom<number[] | "auto">(parseShardList).optional(),
      current: z.number().optional(),
    }),
  }),

  discord: z.object({
    token: z.string(),
    clientId: z.string(),
    clientSecret: z.string().optional(),
  }),

  logger: z.object({
    level: z.enum(["debug", "verbose", "info", "warn", "error"]),
    pretty: z.any().optional().transform(parseBool),
    files: z.any().optional().transform(parseBool),
  }),

  session: z.object({
    secret: z.string(),
    cookie: z.object({
      secure: z.boolean().default(false),
      maxAge: z.number().default(24 * 60 * 60 * 1000), // 24 hours
      sameSite: z.enum(["lax", "strict", "none"]).default("lax"),
      httpOnly: z.boolean().default(true),
    }),
  }),

  ai: z.object({
    provider: z.enum(["openai", "anthropic", "google", "azure"]).optional(),
    apiKey: z.string().optional(),
    model: z.string().optional(),
    baseUrl: z.string().url().optional(),
    maxTokens: z.number().positive().optional(),
    temperature: z.number().min(0).max(2).optional(),
  }),
});
