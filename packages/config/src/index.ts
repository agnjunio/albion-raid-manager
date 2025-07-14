import { schema } from "./schema";

const isProd = process.env.NODE_ENV === "production";

const config = schema.safeParse({
  service: {
    name: process.env.SERVICE ?? "albion-raid-manager",
  },

  api: {
    port: process.env.API_PORT,
    cors: {
      origin: process.env.API_CORS_ORIGIN ?? (isProd ? "https://albion-raid-manager.com" : "http://localhost:5173"),
    },
  },

  bot: {
    shards: {
      total: process.env.SHARDS_TOTAL,
      list: process.env.SHARDS_SPAWN,
      current: process.env.SHARD,
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

  session: {
    secret: process.env.SESSION_SECRET ?? "your-secret-key",
    cookie: {
      secure: isProd,
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      sameSite: isProd ? "none" : "lax",
      httpOnly: true,
    },
  },

  ai: {
    provider: process.env.AI_PROVIDER || "openai",
    apiKey: process.env.AI_API_KEY,
    model: process.env.AI_MODEL || "gpt-4",
    baseUrl: process.env.AI_BASE_URL,
    maxTokens: process.env.AI_MAX_TOKENS ? parseInt(process.env.AI_MAX_TOKENS) : undefined,
    temperature: process.env.AI_TEMPERATURE ? parseFloat(process.env.AI_TEMPERATURE) : undefined,
  },
});

if (!config.success) {
  console.error("❌ Invalid configuration:", config.error.issues);
  process.exit(1);
}

export default config.data;
