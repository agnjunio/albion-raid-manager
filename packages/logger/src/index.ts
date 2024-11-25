import config from "config";
import path from "node:path";
import { createLogger, format, transports } from "winston";

const level: string = config.has("logger.level") ? config.get("logger.level") : "debug";

const logger = createLogger({
  level: "debug",
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  defaultMeta: {
    get service() {
      return process.env.SERVICE;
    },
    get shard() {
      return process.env.SHARD;
    },
  },
  transports: [
    new transports.File({
      filename: path.join("logs", "debug.log"),
      level: "debug",
      maxsize: 10 * Math.pow(1024, 2), // 10 MB
      maxFiles: 1,
      tailable: true,
    }),
    new transports.File({
      filename: path.join("logs", "error.log"),
      level: "error",
      maxsize: 1 * Math.pow(1024, 1), // 1 MB
      maxFiles: 1,
      tailable: true,
    }),
  ],
});

const consoleFormat = format.printf(({ level, message, timestamp, [Symbol.for("level")]: logLevel, shard }) => {
  const printSpace = (count: number) => " ".repeat(Math.max(count, 0));

  const maxLen = "verbose".length;
  const count = maxLen - logLevel.length;
  const spacing = printSpace(count);
  const shardStr = shard ? `[#${shard}] ` : "";
  return `${timestamp} [${level}] ${spacing}: ${shardStr}${message}`;
});

if (process.env.NODE_ENV !== "production") {
  logger.add(
    new transports.Console({
      format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.colorize(), consoleFormat),
      level,
    }),
  );
}

export default logger;
