import express from "express";
import cors from "cors";
import { chatRoutes } from "./route/chatRoutes.js";
import { initializeCollections } from "./config/collectionsInit.js";
import { connectDatabase, testDatabase } from "./config/dbInit.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import logger from "./config/loggerInit.js";
import envInit from "./config/envInit.js";
import { Server as SocketIOServer } from "socket.io";
import http from "http";
import path from "path";
import mongoose from "mongoose";
import socketAuthMiddleware from "./middleware/socketAuthMiddleware.js";
import { authorizeChatParticipantService } from "./service/chatService.js";
import { getUserRoom } from "./util/chatRealtime.js";

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());
app.use("/uploads/chat", express.static(path.join(__dirname, "uploads", "chat")));

app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;

const server = http.createServer(app);

const io = new SocketIOServer(server, {
  cors: {
    origin: [process.env.CLIENT_URL, process.env.DOMAIN_URL],
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true
  }
});

app.set("io", io);

const getChatRoom = (chatId) => `chat_${chatId}`;

const isValidChatId = (chatId) =>
  typeof chatId === "string" && mongoose.isValidObjectId(chatId);

io.use(socketAuthMiddleware);

io.on("connection", (socket) => {
  const { userId, role } = socket.data.user;
  const userRoom = getUserRoom(userId);

  socket.join(userRoom);
  logger.info(
    `🟢 Client connected: ${socket.id} (user ${userId}, role ${role}) joined ${userRoom}`
  );

  socket.on("join_chat", async (payload, ack) => {
    const respond = typeof ack === "function" ? ack : () => {};
    const chatId = payload?.chatId;

    if (!isValidChatId(chatId)) {
      socket.emit("chat_error", { message: "Unable to join chat" });
      return respond({ success: false, error: "Unable to join chat" });
    }

    const authorization = await authorizeChatParticipantService({
      chatId,
      userId,
      role,
      token: socket.data.authToken,
    });

    if (!authorization.success) {
      logger.warn(
        `[SOCKET] Rejected join_chat for user ${userId} on chat ${chatId}`
      );
      socket.emit("chat_error", { message: "Unable to join chat" });
      return respond({ success: false, error: "Unable to join chat" });
    }

    const room = getChatRoom(chatId);
    socket.join(room);
    logger.info(`[SOCKET] User ${userId} joined ${room}`);

    respond({ success: true, room });
    socket.emit("chat_joined", { room });
  });

  socket.on("leave_chat", (payload, ack) => {
    const respond = typeof ack === "function" ? ack : () => {};
    const chatId = payload?.chatId;

    if (!isValidChatId(chatId)) {
      return respond({ success: false, error: "Unable to leave chat" });
    }

    const room = getChatRoom(chatId);
    socket.leave(room);
    logger.info(`[SOCKET] User ${userId} left ${room}`);

    return respond({ success: true, room });
  });

  socket.on("typing", (data) => {
    const chatId = data?.chatId;

    if (!isValidChatId(chatId)) {
      return;
    }

    const room = getChatRoom(chatId);
    if (!socket.rooms.has(room)) {
      logger.warn(
        `[SOCKET] Ignored typing from user ${userId} outside chat ${chatId}`
      );
      return;
    }

    const isTyping = Boolean(data.isTyping);
    const username =
      typeof data.username === "string" && data.username.trim()
        ? data.username.trim().slice(0, 100)
        : "User";

    logger.info(
      `User ${userId} (${username}) ${isTyping ? "started" : "stopped"} typing in chat ${chatId}`
    );

    socket.to(room).emit("user_typing", {
      userId,
      username,
      isTyping,
      timestamp: new Date().toISOString(),
    });
  });

  socket.on("disconnect", (reason) => {
    logger.info(
      `🔴 Client disconnected: ${socket.id} (user ${userId}), reason: ${reason}`
    );
  });
});

app.use(cors({
  origin: [process.env.CLIENT_URL], 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));
app.use("/", chatRoutes);

(async () => {
  try {
    await connectDatabase();
    await testDatabase();
    await initializeCollections();
    
    logger.info("✅ Database, Redis, and RabbitMQ initialized successfully");

    server.listen(PORT, () => {
      logger.info(`🚀 Server with WebSocket running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Error initializing services:", error);
  }
})();