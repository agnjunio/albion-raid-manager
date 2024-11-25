import logger from "@black-river-gaming/logger";
import config from "config";
import { ShardingManager } from "discord.js";
import path from "path";

let manager: ShardingManager;

export async function run() {
  if (!config.has("discord.token")) {
    throw new Error("Please define the discord token.");
  }

  logger.info("Starting the Shard Manager.");

  const bot = path.join(__dirname, "bot.ts");

  manager = new ShardingManager(bot, {
    token: config.get("discord.token"),
    totalShards: config.has("bot.shards.total") ? config.get("bot.shards.total") : undefined,
    shardList: config.has("bot.shards.list") ? config.get("bot.shards.list") : undefined,
    respawn: true,
    execArgv: ["-r", "ts-node/esm"],
  });

  await manager.spawn();
}

export async function cleanup() {
  logger.info("Shutting down Shard Manager.");

  for (const shard of manager.shards.values()) {
    logger.verbose(`Killing shard #${shard.id}`);
    await shard.kill();
  }
}

export default {
  run,
  cleanup,
};
