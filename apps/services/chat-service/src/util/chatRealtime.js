import logger from "../config/loggerInit.js";

const toPlainChat = (chat) => (chat.toObject ? chat.toObject() : chat);

export const getUserRoom = (userId) => {
  if (!userId) return null;
  return `user_${userId}`;
};

export const getChatRooms = (chat) => {
  const plainChat = toPlainChat(chat);
  const rooms = [getUserRoom(plainChat.userId), getUserRoom(plainChat.sellerId)].filter(Boolean);

  if (!plainChat.sellerId) {
    logger.warn(`Chat ${plainChat._id} has no sellerId; seller will not receive realtime updates`);
  }

  return rooms;
};

export const emitChatUpdate = (io, chat) => {
  if (!io || !chat) return;

  const plainChat = toPlainChat(chat);
  const rooms = getChatRooms(plainChat);

  rooms.forEach((room) => {
    io.to(room).emit("update_chat", { updatedChat: plainChat });
  });

  logger.info(`WebSocket: Emitted update_chat to ${rooms.join(", ")}`);
};
