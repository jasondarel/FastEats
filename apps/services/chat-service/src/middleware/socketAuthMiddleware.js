import jwt from "jsonwebtoken";
import logger from "../config/loggerInit.js";

const ALLOWED_ROLES = new Set(["user", "seller"]);

const socketAuthMiddleware = (socket, next) => {
  const token = socket.handshake.auth?.token;

  if (!token || typeof token !== "string") {
    logger.warn(`[SOCKET AUTH] Missing token for socket ${socket.id}`);
    return next(new Error("Unauthorized"));
  }

  try {
    const decoded = jwt.verify(
      token.replace(/^Bearer\s+/i, ""),
      process.env.JWT_SECRET
    );

    const userId = Number(decoded.userId);
    const role = decoded.role;

    if (!Number.isFinite(userId) || userId <= 0 || !ALLOWED_ROLES.has(role)) {
      logger.warn(
        `[SOCKET AUTH] Invalid token claims for socket ${socket.id}`
      );
      return next(new Error("Unauthorized"));
    }

    socket.data.user = { userId, role };
    socket.data.authToken = token;

    return next();
  } catch (error) {
    logger.warn(
      `[SOCKET AUTH] Token verification failed for socket ${socket.id}: ${error.message}`
    );
    return next(new Error("Unauthorized"));
  }
};

export default socketAuthMiddleware;
