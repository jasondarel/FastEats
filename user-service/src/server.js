import express from "express";
import cors from "cors";
import createTables from "./config/tablesinit.js";
import dotenv from "dotenv";
import userRoutes from "./route/userRoute.js";
import fileUpload from "express-fileupload";
import { rabbitMQInit } from "./config/rabbitMQInit.js";
import { redisInit } from "./config/redisInit.js";
import logger from "./config/loggerInit.js";

const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: envFile });
logger.info(`Using ${envFile} file`);

const app = express();
const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: [process.env.CLIENT_URL],
  })
);
app.use(fileUpload());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/", userRoutes);

logger.info(`${process.env.SERVICE_NAME || "User/Auth Service"} running on port ${PORT}`);

try {
  createTables();
  redisInit();
  rabbitMQInit();
  logger.info("Database, Redis, and RabbitMQ initialized successfully");
} catch (error) {
  logger.error("Error initializing services:", error);
}

app.listen(PORT, () => {
  logger.info(`Server running on http://localhost:${PORT}`);
});
