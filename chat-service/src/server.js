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

io.on("connection", (socket) => {
  logger.info(`🟢 New client connected: ${socket.id}`);
  
  socket.on('join_room', (roomId) => {
    const room = String(roomId);
    logger.info(`Client ${socket.id} joining room: ${room}`);
    
    socket.join(room);

    logger.info(`Client ${socket.id} is now in rooms: ${Array.from(socket.rooms).join(', ')}`);
    
    socket.emit('room_joined', { room, success: true });
    
    socket.to(room).emit('user_joined', { userId: socket.id });
  });
  
  socket.on('send_message', (messageData) => {
    try {
      const { chatId } = messageData;
      const roomId = `chat_${chatId}`;
      
      const plainMessage = typeof messageData.toJSON === 'function' 
        ? messageData.toJSON() 
        : messageData;
      
      logger.info(`Broadcasting message to room ${roomId}`);

      io.to(roomId).emit('new_message', plainMessage);
      
      logger.info(`Message broadcasted to room ${roomId}`);
    } catch (error) {
      logger.error('Error sending message:', error);
      socket.emit('message_error', { error: error.message });
    }
  });
  
  socket.on('list_rooms', async (callback) => {
    try {
      const rooms = {};
      
      for (const [roomId, socketSet] of io.of('/').adapter.rooms.entries()) {
        if (roomId === socket.id) continue;
        
        rooms[roomId] = Array.from(socketSet).length;
      }
      
      if (typeof callback === 'function') {
        callback({ rooms });
      } else {
        socket.emit('rooms_list', { rooms });
      }
    } catch (error) {
      logger.error('Error listing rooms:', error);
      if (typeof callback === 'function') {
        callback({ error: error.message });
      } else {
        socket.emit('rooms_list', { error: error.message });
      }
    }
  });

  socket.on('typing', (data) => {
    if (data.isTyping) {
      logger.info(`User ${data.userId} (${data.username}) started typing in chat ${data.chatId}`);
    } else {
      logger.info(`User ${data.userId} (${data.username}) stopped typing in chat ${data.chatId}`);
    }
    
    const roomId = `chat_${data.chatId}`;
    socket.to(roomId).emit('user_typing', {
      userId: data.userId,
      username: data.username,
      isTyping: data.isTyping,
      timestamp: new Date().toISOString()
    });
  });
  
  socket.on('leave_room', (roomId) => {
    socket.leave(roomId);
    logger.info(`Client ${socket.id} left room ${roomId}`);
    socket.emit('room_left', { room: roomId });
  });
  
  socket.on("disconnect", (reason) => {
    logger.info(`🔴 Client disconnected: ${socket.id}, reason: ${reason}`);
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