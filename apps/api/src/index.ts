import { logger } from "@albion-raid-manager/core/logger";

import { cleanup, run } from "./app";

async function start() {
  try {
    logger.info("Starting the API Server.");

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
