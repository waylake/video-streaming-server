import winston from "winston";
import winstonDaily from "winston-daily-rotate-file";
import { envConfig } from "./envConfig";

const { combine, timestamp, printf, colorize } = winston.format;

const logDir = "logs"; // logs 디렉토리 하위에 로그 파일 저장

const logFormat = printf((info) => {
  return `${info.timestamp} ${info.level}: ${info.message}`;
});

/*
 * Log Level
 * error: 0, warn: 1, info: 2, http: 3, verbose: 4, debug: 5, silly: 6
 */
export const logger = winston.createLogger({
  format: combine(
    timestamp({
      format: "YYYY-MM-DD HH:mm:ss",
    }),
    logFormat,
  ),
  transports: [
    new winstonDaily({
      level: "info",
      datePattern: "YYYY-MM-DD",
      dirname: logDir,
      filename: `%DATE%.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
    new winstonDaily({
      level: "warn",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/warn",
      filename: `%DATE%.warn.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
    new winstonDaily({
      level: "error",
      datePattern: "YYYY-MM-DD",
      dirname: logDir + "/error",
      filename: `%DATE%.error.log`,
      maxFiles: 30,
      zippedArchive: true,
    }),
  ],
});

if (envConfig.NODE_ENV !== "production") {
  logger.add(
    new winston.transports.Console({
      format: combine(colorize({ all: true }), logFormat),
    }),
  );
}
