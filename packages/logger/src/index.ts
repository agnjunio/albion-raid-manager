import config from "@albion-raid-manager/config";
import path from "path";
import { createLogger, format, transports } from "winston";

const logger = createLogger({
  level: config.logger.level,
  format: format.combine(format.timestamp(), format.errors({ stack: true }), format.json()),
  defaultMeta: {
    get service() {
      return process.env.SERVICE;
    },
    get shard() {
      return process.env.SHARD;
    },
  },
  transports: [],
});

if (!config.logger.pretty) {
  logger.add(new transports.Console());
} else {
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
