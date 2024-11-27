import logger from "@albion-raid-manager/logger";
import config from "config";
import { Client, Events, Partials } from "discord.js";
import { loadControllers } from "./controllers";

const discord = new Client({
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

let init = false;

export async function run() {
  if (!config.has("discord.token")) {
    throw new Error("Please define the discord token.");
  }

  logger.info("Starting the Bot Client.");
  await discord.login(config.get("discord.token"));
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

  if (!init) {
    await loadControllers(discord);
    init = true;
  }
});

export default {
  run,
  cleanup,
};
