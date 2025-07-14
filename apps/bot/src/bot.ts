import config from "@albion-raid-manager/config";
import { logger } from "@albion-raid-manager/logger";
import { Client, Events, IntentsBitField, Partials } from "discord.js";

import { deployCommands, handleCommand } from "./commands";
import { initModules } from "./modules";

export const discord = new Client({
  intents: [IntentsBitField.Flags.Guilds, IntentsBitField.Flags.GuildMessages, IntentsBitField.Flags.MessageContent],
  partials: [Partials.Channel, Partials.Message, Partials.Reaction, Partials.User, Partials.GuildMember],
});

async function run() {
  if (!config.discord.token) {
    throw new Error("Please define the discord token.");
  }

  logger.info("Starting the Bot Client.");
  await initModules({ discord });
  await deployCommands();
  await discord.login(config.discord.token);
}

async function cleanup() {
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

discord.on(Events.InteractionCreate, handleCommand);

discord.on(Events.Debug, (message) => logger.debug(message));

export default {
  run,
  cleanup,
};
