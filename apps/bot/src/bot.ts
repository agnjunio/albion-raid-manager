import config from "@albion-raid-manager/core/config";
import { logger } from "@albion-raid-manager/core/logger";
import { Redis, RedisSubscriber } from "@albion-raid-manager/core/redis";
import { ServersService } from "@albion-raid-manager/core/services";
import { Client, Events, IntentsBitField, Partials } from "discord.js";

import { initModules } from "./modules";

export const discord = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User, Partials.GuildMember],
});

async function run() {
  if (!config.discord.token) {
    throw new Error("Please define the DISCORD_TOKEN environment variable.");
  }

  logger.info("Starting the Bot Client.");

  await Redis.initClient();
  await RedisSubscriber.initClient();
  await initModules({ discord });
  await discord.login(config.discord.token);
}

async function cleanup() {
  logger.info("Shutting down Bot Client.");

  await Redis.disconnect();
  discord.removeAllListeners();
  await discord.destroy();
}

// Since each bot spawns in it's own process, we need this to catch uncaught exceptions
process.on("uncaughtException", async (error) => {
  logger.error(`Uncaught exception: ${error.message}`, { error });
});

// Handle unhandled promise rejections
process.on("unhandledRejection", async (reason, promise) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  logger.error(`Unhandled promise rejection: ${error.message}`, {
    error,
    promise: promise.toString(),
  });
});

discord.on(Events.ShardReady, async (shardId) => {
  process.env.SHARD = shardId.toString();
  logger.info(`Shard online! Bot user: ${discord.user?.tag}. Guild count: ${discord.guilds.cache.size}`);
});

discord.on(Events.GuildCreate, async (guild) => {
  await ServersService.ensureServer(guild.id);
});

discord.on(Events.GuildDelete, async (guild) => {
  await ServersService.updateServer(guild.id, {
    active: false,
  });
});

discord.on(Events.Debug, (message) => logger.debug(message));

export default {
  run,
  cleanup,
};
