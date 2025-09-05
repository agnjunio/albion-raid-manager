import { Server } from "http";

import config from "@albion-raid-manager/config";
import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { RedisClient } from "@albion-raid-manager/redis";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import cors from "cors";
import express from "express";
import session from "express-session";
import morgan from "morgan";

import { context } from "./context";
import { errors } from "./errors";
import { router } from "./router";

// Redis client for session storage and other Redis functionality
let redisClient: RedisClient | null = null;

export function createApp(): express.Application {
  const app = express();

  // CORS configuration
  app.use(
    cors({
      origin: config.api.cors.origin,
      credentials: true,
    }),
  );

  // Body parsing middleware
  app.use(express.urlencoded({ extended: true }));
  app.use(express.json());

  // HTTP request logging
  app.use(
    morgan("dev", {
      stream: {
        write: (message: string) => {
          logger.info(message.trim());
        },
      },
    }),
  );

  // Session configuration
  app.use(
    session({
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
      cookie: config.session.cookie,
      store: new PrismaSessionStore(prisma, {
        checkPeriod: 12 * 60 * 60 * 1000, // 12 hours
      }),
    }),
  );

  // Application middleware
  app.use(context);
  app.use(router);
  app.use(errors);

  return app;
}

export function getRedisClient(): RedisClient | null {
  return redisClient;
}

export async function run(): Promise<Server> {
  if (!config.api.port) {
    throw new Error("Please define the API_PORT environment variable.");
  }

  try {
    redisClient = new RedisClient();
    await redisClient.connect();
  } catch (error) {
    logger.error("Failed to initialize Redis client", { error });
  }

  const app = createApp();
  const port = config.api.port;

  const server = app.listen(port, () => {
    logger.info(`Server is running on port ${port}`);
  });

  return server;
}

export async function cleanup(server: Server): Promise<void> {
  logger.info("Shutting down API Server.");

  if (redisClient) {
    try {
      await redisClient.disconnect();
      redisClient = null;
      logger.info("Redis client disconnected");
    } catch (error) {
      logger.error("Error during Redis client shutdown", { error });
    }
  }

  return new Promise<void>((resolve) => {
    server.close(() => {
      logger.info("Server shutdown");
      resolve();
    });
  });
}
