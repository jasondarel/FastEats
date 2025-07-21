import logger from "./src/config/loggerInit.js";
import express from "express";
import cors from "cors";
import OrderRoutes from "./src/routes/OrderRoutes.js";
import envInit from "./src/config/envInit.js";
// import createTables from "./src/config/tablesInit.js";
import { createDatabase, testDatabase } from "./src/config/dbInit.js";
import { rabbitMQInit } from "./src/config/rabbitMQInit.js";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import cron from "node-cron";
import { publishCompletedOrderMessage, publishPreparingOrderMessage } from "./src/util/orderUtil.js";
import { redisInit } from "./src/config/redisInit.js";
import Redis from "ioredis";
import setupRedisOrderEvents from "./src/events/redis-order-event.js";

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const app = express();
const PORT = process.env.PORT || 5000;

const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: process.env.CLIENT_URL,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  }
});

app.set("io", io);

io.on("connection", (socket) => {
  logger.info(`🟢 New client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`🔴 Client disconnected: ${socket.id}`);
  });
});

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(OrderRoutes);

setupRedisOrderEvents(io);

(async () => {
  try {
    await createDatabase();
    await testDatabase();
    // await createTables();
    await rabbitMQInit();
    await redisInit();

    logger.info("✅ Database, Redis, and RabbitMQ initialized successfully");

    // Start server after all initializations
    server.listen(PORT, () => {
      logger.info(`🚀 Server with WebSocket running on http://localhost:${PORT}`);
    });

    cron.schedule("*/5 * * * * *", async () => {
      logger.info("⏰ Running scheduled publisher: publishPreparingOrderMessage");
      await publishPreparingOrderMessage();
    });

    cron.schedule("*/5 * * * * *", async () => {
      logger.info("⏰ Running scheduled publisher: publishCompletedOrderMessage");
      await publishCompletedOrderMessage();
    });

  } catch (error) {
    logger.error("❌ Error initializing services:", error);
  }
})();