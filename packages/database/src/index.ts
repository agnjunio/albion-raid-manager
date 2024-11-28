import logger from "@albion-raid-manager/logger";
import { PrismaClient } from "@prisma/client";

export const prisma = new PrismaClient({
  log: [
    {
      emit: "event",
      level: "query",
    },
    {
      emit: "event",
      level: "error",
    },
    {
      emit: "event",
      level: "info",
    },
    {
      emit: "event",
      level: "warn",
    },
  ],
});

prisma.$on("query", (event) => {
  logger.debug(`(Prisma) ${event.query}`, event);
});

prisma.$on("error", (event) => {
  logger.error(`(Prisma) ${event.message}`, event);
});

prisma.$on("info", (event) => {
  logger.info(`(Prisma) ${event.message}`, event);
});

prisma.$on("warn", (event) => {
  logger.warn(`(Prisma) ${event.message}`, event);
});
