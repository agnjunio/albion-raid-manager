import { Server } from "http";

import config from "@albion-raid-manager/core/config";
import { prisma } from "@albion-raid-manager/core/database";
import { logger } from "@albion-raid-manager/core/logger";
import { Redis } from "@albion-raid-manager/core/redis";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import cors from "cors";
import express from "express";
import session from "express-session";
import morgan from "morgan";

import { context } from "./context";
import { errors } from "./errors";
import { router } from "./router";

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

  // Health check middleware
  app.get("/health", (req, res) => {
    res.status(200).json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  });

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
  app.set("trust proxy", 1);
  app.use(
    session({
      cookie: config.session.cookie,
      secret: config.session.secret,
      resave: false,
      saveUninitialized: false,
      store: new PrismaSessionStore(prisma, {
        checkPeriod: 12 * 60 * 60 * 1000, // 12 hours
        ttl: 24 * 60 * 60 * 1000, // 24 hours - session TTL
      }),
    }),
  );

  // Application middleware
  app.use(context);
  app.use(router);
  app.use(errors);

  return app;
}

export async function run(): Promise<Server> {
  if (!config.api.port) {
    throw new Error("Please define the API_PORT environment variable.");
  }

  try {
    await Redis.initClient();
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

  await Redis.disconnect();

  return new Promise<void>((resolve) => {
    server.close(() => {
      logger.info("Server shutdown");
      resolve();
    });
  });
}
