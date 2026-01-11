import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";
import envInit from "./envInit.js";
envInit();

const initLogger = () => {
  return winston.createLogger({
    level: process.env.LOGGER_LEVEL || "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${stack || ""}`;
      })
    ),
    transports: [
      new DailyRotateFile({
        filename: "logs/workers-%DATE%.log",
        datePattern: "YYYY-MM-DD",
        maxSize: "20m",
        maxFiles: "14d",
        zippedArchive: true,
      }),
      new winston.transports.Console(),
    ],
  });
};

const logger = initLogger();
export default logger;
