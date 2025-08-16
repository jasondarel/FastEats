import logger from "./src/config/loggerInit.js";
import express from "express";
import cors from "cors";
import OrderRoutes from "./src/routes/OrderRoutes.js";
import envInit from "./src/config/envInit.js";
import { createDatabase, testDatabase } from "./src/config/dbInit.js";
import { rabbitMQInit } from "./src/config/rabbitMQInit.js";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import cron from "node-cron";
import { publishCompletedOrderMessage, publishPreparingOrderMessage } from "./src/util/orderUtil.js";

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const app = express();
const PORT = process.env.PORT || 5000;
const server = http.createServer(app);

const allowedOrigins = [
  process.env.CLIENT_URL,
  process.env.DOMAIN_URL,
].filter(Boolean);

const io = new SocketIOServer(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    credentials: true
  }
});

app.set("io", io);
io.on("connection", (socket) => {
  logger.info(`🟢 New client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    logger.info(`🔴 Client disconnected: ${socket.id}`);
  });
});

app.use(cors({ 
  origin: allowedOrigins,
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"]
}));

app.use(express.json());
app.use(OrderRoutes);

(async () => {
  try {
    await createDatabase();
    await testDatabase();
    await rabbitMQInit();

    logger.info("✅ Database, Redis, and RabbitMQ initialized successfully");
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