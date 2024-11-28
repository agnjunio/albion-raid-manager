import config from "config";
import path from "node:path";
import { createLogger, format, transports } from "winston";

const level: string = config.has("logger.level") ? config.get("logger.level") : "debug";
const file: boolean = config.has("logger.file") ? config.get("logger.file") : false;

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
});

if (process.env.NODE_ENV !== "production") {
  const consoleFormat = format.printf(({ level, [Symbol.for("level")]: logLevel, message, timestamp, shard }) => {
    const printSpace = (count: number) => " ".repeat(Math.max(count, 0));

    const maxLen = "verbose".length;
    const count = maxLen - (logLevel as string).length;
    const spacing = printSpace(count);
    const shardStr = shard ? `[#${shard}] ` : "";
    return `${timestamp} [${level}] ${spacing}: ${shardStr}${message}`;
  });

  logger.add(
    new transports.Console({
      format: format.combine(format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }), format.colorize(), consoleFormat),
      level,
    }),
  );
}

if (file) {
  logger.add(
    new transports.File({
      filename: path.join("logs", "debug.log"),
      level: "debug",
      maxsize: 10 * Math.pow(1024, 2), // 10 MB
      maxFiles: 1,
      tailable: true,
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

export default logger;
