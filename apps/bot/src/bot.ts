import config from "@albion-raid-manager/config";
import logger from "@albion-raid-manager/logger";
import { Client, Events, Partials } from "discord.js";
import { loadModules } from "./modules";

export const discord = new Client({
  intents: [],
  partials: [
    Partials.Channel,
    Partials.GuildMember,
    Partials.GuildScheduledEvent,
    Partials.Message,
    Partials.Reaction,
    Partials.ThreadMember,
    Partials.User,
  ],
});

export async function run() {
  if (!config.discord.token) {
    throw new Error("Please define the discord token.");
  }

  logger.info("Starting the Bot Client.");
  await loadModules({ discord });
  await discord.login(config.discord.token);
}

export async function cleanup() {
  logger.info("Shutting down Bot Client.");
  discord.removeAllListeners();
  await discord.destroy();
}

// Since each bot spawns in it's own process, we need this to catch uncaught exceptions
process.on("uncaughtException", async (error) => {
  logger.error(`Uncaught exception: ${error.message}`, { error });
});

discord.on(Events.ShardReady, async (shardId) => {
  process.env.SHARD = shardId.toString();
  logger.info(`Shard online! Bot user: ${discord.user?.tag}. Guild count: ${discord.guilds.cache.size}`);
});

export default {
  run,
  cleanup,
};
