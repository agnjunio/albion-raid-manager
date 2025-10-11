import { join } from "node:path";

import { logger } from "@albion-raid-manager/core/logger";
import { readVersion } from "@albion-raid-manager/core/utils";

import { cleanup, run } from "./app";

// Read version from package.json
const version = readVersion(join(__dirname, "..", "package.json"));

async function start() {
  try {
    logger.info(`Starting the API Server v${version}`);

    const server = await run();

    const shutdownHandler = async () => {
      await cleanup(server);
      process.exit(0);
    };

    // Handle cleanup on server shutdown
    process.on("SIGTERM", shutdownHandler);
    // Handle ts-node-dev reloads
    process.on("SIGINT", shutdownHandler);
    process.on("SIGUSR2", shutdownHandler);

    // Catches uncaught exceptions
    process.on("uncaughtException", async (error) => {
      logger.error(`Uncaught exception:`, { error });
    });
  } catch (error) {
    let message = "Unknown error";
    if (error instanceof Error) message = error.message;

    logger.error(`An error occurred while running: ${message}`, { error });
    process.exit(1);
  }
}

if (require.main === module) {
  start();
}
