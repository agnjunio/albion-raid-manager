import { z } from "zod";

import { parseBool, parseShardList, parseShardsTotal } from "./parsers";

export const schema = z.object({
  service: z.object({
    name: z.string(),
    application: z.string(),
    version: z.string(),
  }),

  api: z.object({
    port: z.coerce.number().default(3000),
    cors: z.object({
      origin: z.union([z.string(), z.array(z.string())]),
    }),
  }),

  bot: z.object({
    shards: z.object({
      total: z.custom<number | "auto">(parseShardsTotal).optional(),
      list: z.custom<number[] | "auto">(parseShardList).optional(),
      current: z.number().optional(),
    }),
  }),

  dashboard: z.object({
    url: z.string().url().optional(),
  }),

  discord: z.object({
    token: z.string().optional(),
    clientId: z.string().optional(),
    clientSecret: z.string().optional(),
    communityUrl: z.string().url().optional(),
  }),

  logger: z.object({
    level: z.enum(["debug", "verbose", "info", "warn", "error"]),
    pretty: z.any().optional().transform(parseBool),
    files: z.any().optional().transform(parseBool),
  }),

  redis: z.object({
    url: z.string().url(),
  }),

  session: z.object({
    secret: z.string(),
    cookie: z.object({
      secure: z.boolean().default(false),
      sameSite: z.enum(["lax", "strict", "none"]).default("none"),
      domain: z.string().optional(),
      maxAge: z.number().default(24 * 60 * 60 * 1000), // 24 hours
      httpOnly: z.boolean().default(true),
    }),
  }),

  ai: z.object({
    enabled: z.any().optional().transform(parseBool).default(false),
    provider: z.enum(["openai", "anthropic", "google", "azure"]).default("openai"),
    apiKey: z.string().optional(),
    model: z.string().optional(),
    baseUrl: z.string().url().optional(),
    maxTokens: z.number().positive().optional(),
    temperature: z.number().min(0).max(2).optional(),
  }),
});
