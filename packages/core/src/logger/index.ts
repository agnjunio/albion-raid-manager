import "./tracer";

import path from "path";

import { createLogger, format, transports } from "winston";

import config from "@albion-raid-manager/core/config";

import { formatAxios } from "./format-axios";
import { formatErrors } from "./format-errors";

const logger = createLogger({
  level: config.logger.level,
  format: format.combine(format.timestamp(), formatAxios(), formatErrors(), format.json()),
  defaultMeta: {
    get service() {
      return config.service.name;
    },
    get application() {
      return config.service.application;
    },
    get shard() {
      return config.bot.shards.current;
    },
  },
  transports: [],
});

if (!config.logger.pretty) {
  logger.add(new transports.Console());
} else {
  const consoleFormat = format.printf(
    ({ level, [Symbol.for("level")]: logLevel, application, message, timestamp, shard, error }) => {
      const printSpace = (count: number) => " ".repeat(Math.max(count, 0));

      const applicationStr = `[${application}${shard ? `#${shard}` : ""}]`;
      const maxLen = "verbose".length;
      const count = maxLen - (logLevel as string).length;
      const spacing = printSpace(count);
      const errorStr = error ? `\n${error instanceof Error ? error.stack : JSON.stringify(error, null, 2)}` : "";

      return `${timestamp} [${level}] ${spacing}: ${applicationStr} ${message}${errorStr}`;
    },
  );

  logger.add(
    new transports.Console({
      format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.colorize(), consoleFormat),
    }),
  );
}

if (config.logger.files) {
  logger.add(
    new transports.File({
      filename: path.join("logs", "debug.log"),
      level: "debug",
      maxsize: 10 * Math.pow(1024, 2), // 10 MB
      maxFiles: 1,
      tailable: true,
      options: { flags: "w" }, // Truncate file on startup
    }),
  );

  logger.add(
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxsize: 1 * Math.pow(1024, 1), // 1 MB
      maxFiles: 1,
      tailable: true,
    }),
  );
}

export { logger };
