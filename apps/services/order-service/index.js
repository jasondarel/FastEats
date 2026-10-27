import logger from "./src/config/loggerInit.js";
import express from "express";
import cors from "cors";
import OrderRoutes from "./src/routes/OrderRoutes.js";
import envInit from "./src/config/envInit.js";
import { createDatabase, testDatabase } from "./src/config/dbInit.js";
import { rabbitMQInit } from "./src/config/rabbitMQInit.js";
import { initSocketBridge } from "./src/config/socketBridgeInit.js";
import { Server as SocketIOServer } from "socket.io";
import http from "http";

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

const resolveRoomId = (payload, idKey) => {
  if (payload && typeof payload === "object") {
    return payload[idKey] ?? payload.id;
  }
  return payload;
};

const joinRoom = (socket, roomPrefix, id) => {
  if (id === undefined || id === null || id === "") {
    logger.warn(
      `⚠️ Socket ${socket.id} tried to join a "${roomPrefix}" room without an id`
    );
    return;
  }

  const room = `${roomPrefix}:${id}`;
  socket.join(room);
  logger.info(`🟢 Socket ${socket.id} joined room "${room}"`);
};

app.set("io", io);
io.on("connection", (socket) => {
  logger.info(`🟢 New client connected: ${socket.id}`);

  socket.on("joinOrder", (payload) =>
    joinRoom(socket, "order", resolveRoomId(payload, "order_id"))
  );
  socket.on("joinUser", (payload) =>
    joinRoom(socket, "user", resolveRoomId(payload, "user_id"))
  );

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
    initSocketBridge(io);

    logger.info("✅ Database, Redis, and RabbitMQ initialized successfully");
    server.listen(PORT, () => {
      logger.info(`🚀 Server with WebSocket running on http://localhost:${PORT}`);
    });

  } catch (error) {
    logger.error("❌ Error initializing services:", error);
  }
})();