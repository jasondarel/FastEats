import winston from "winston";
import DailyRotateFile from "winston-daily-rotate-file";

// Function to initialize logger
const initLogger = () => {
  return winston.createLogger({
    level: "info",
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.printf(({ level, message, timestamp, stack }) => {
        return `${timestamp} [${level.toUpperCase()}]: ${message} ${stack || ""}`;
      })
    ),
    transports: [
      new DailyRotateFile({
        filename: "logs/user-service-%DATE%.log", // Log file format
        datePattern: "YYYY-MM-DD", // Rotate logs daily
        maxSize: "20m", // Max size per file
        maxFiles: "14d", // Keep logs for 14 days
        zippedArchive: true, // Compress old logs
      }),
      new winston.transports.Console(),
    ],
  });
};

const logger = initLogger();
export default logger;
