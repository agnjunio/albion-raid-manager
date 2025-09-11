import { logger } from "@albion-raid-manager/core/logger";

import bot from "./bot";
import shard from "./shard";

enum Mode {
  BOT = "bot",
  SHARD = "shard",
}

async function start() {
  try {
    const mode = (process.env.MODE || Mode.BOT) as Mode;
    if (!mode) throw new Error("Mode not defined");
    if (!Object.values(Mode).includes(mode)) throw new Error("Mode not supported");

    const { run, cleanup } = {
      [Mode.SHARD]: shard,
      [Mode.BOT]: bot,
    }[mode];

    if (!run) throw new Error("Mode does not expose a run function");

    if (cleanup) {
      //catches ctrl+c event
      process.once("SIGINT", await cleanup);
      // graceful shutdown when using nodemon
      process.once("SIGHUP", await cleanup);
      process.once("SIGUSR2", await cleanup);
    }

    //catches uncaught exceptions
    process.on("uncaughtException", async (error) => {
      logger.error(`Uncaught exception:`, error);
    });

    await run();
  } catch (error) {
    let message = "Unknown error";
    if (error instanceof Error) message = error.message;

    logger.error(`An error ocurred while running: ${message}`, { error });
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
