import path from "path";

import config from "@albion-raid-manager/core/config";
import { logger } from "@albion-raid-manager/logger";
import { ShardingManager } from "discord.js";

let manager: ShardingManager;

export async function run() {
  if (!config.discord?.token) {
    throw new Error("Please define the discord token.");
  }

  logger.info("Starting the Shard Manager.");

  const bot = path.join(__dirname, "bot.ts");

  manager = new ShardingManager(bot, {
    token: config.discord.token,
    totalShards: config.bot?.shards?.total,
    shardList: config.bot?.shards?.list,
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
