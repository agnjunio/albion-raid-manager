import config from "@albion-raid-manager/config";
import { prisma } from "@albion-raid-manager/database";
import { logger } from "@albion-raid-manager/logger";
import { PrismaSessionStore } from "@quixo3/prisma-session-store";
import cors from "cors";
import express from "express";
import session from "express-session";
import morgan from "morgan";

import { router } from "./router";

const app = express();
const port = config.api.port;

app.use(
  cors({
    origin: config.api.cors.origin,
    credentials: true,
  }),
);

app.use(express.urlencoded({ extended: true }));

app.use(express.json());

app.use(
  morgan("dev", {
    stream: {
      write: (message: string) => {
        logger.info(message.trim());
      },
    },
  }),
);

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

app.use(router);

const server = app.listen(port, () => {
  logger.info(`Server is running on port ${port}`);
});

const shutdown = () => {
  server.close(() => {
    logger.info("Server shutdown");
    process.exit(0);
  });
};

// Handle cleanup on server shutdown
process.on("SIGTERM", shutdown);
// Handle ts-node-dev reloads
process.on("SIGINT", shutdown);
process.on("SIGUSR2", shutdown);
