import Redis from "ioredis";
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const REDIS_HOST = process.env.REDIS_HOST || "127.0.0.1";
const REDIS_PORT = process.env.REDIS_PORT ? Number(process.env.REDIS_PORT) : 6379;

export const SOCKET_EVENTS_CHANNEL =
  process.env.SOCKET_EVENTS_CHANNEL || "fasteats:order:events";

let subscriber;
let ioServer;

const handleMessage = (rawMessage) => {
  let message;

  try {
    message = JSON.parse(rawMessage);
  } catch (error) {
    logger.error(
      `❌ Failed to parse socket event from channel "${SOCKET_EVENTS_CHANNEL}":`,
      error
    );
    return;
  }

  const { room, event, data } = message || {};

  if (!room || !event) {
    logger.warn(
      `⚠️ Ignoring malformed socket event on "${SOCKET_EVENTS_CHANNEL}": missing room or event`
    );
    return;
  }

  if (!ioServer) {
    logger.warn("⚠️ Socket.IO server not attached; dropping socket event");
    return;
  }

  ioServer.to(room).emit(event, data);
  logger.info(`📡 Emitted "${event}" to room "${room}"`);
};

export const initSocketBridge = (io) => {
  if (subscriber) return subscriber;

  ioServer = io;

  subscriber = new Redis({
    host: REDIS_HOST,
    port: REDIS_PORT,
    retryStrategy: (times) => {
      const delay = Math.min(times * 100, 3000);
      logger.warn(`🔄 Redis subscriber reconnecting in ${delay}ms (attempt: ${times})`);
      return delay;
    },
  });

  subscriber.on("connect", () => {
    logger.info(`✅ Redis subscriber connected on ${REDIS_HOST}:${REDIS_PORT}`);
  });

  subscriber.on("error", (error) => {
    logger.error("❌ Redis subscriber connection failed:", error);
  });

  subscriber.on("message", (channel, rawMessage) => {
    if (channel !== SOCKET_EVENTS_CHANNEL) return;
    handleMessage(rawMessage);
  });

  subscriber.subscribe(SOCKET_EVENTS_CHANNEL, (error) => {
    if (error) {
      logger.error(
        `❌ Failed to subscribe to Redis channel "${SOCKET_EVENTS_CHANNEL}":`,
        error
      );
      return;
    }

    logger.info(
      `✅ Socket.IO bridge subscribed to Redis channel "${SOCKET_EVENTS_CHANNEL}"`
    );
  });

  return subscriber;
};

export const closeSocketBridge = async () => {
  try {
    if (subscriber) {
      await subscriber.quit();
    }
  } catch (error) {
    logger.error("❌ Failed to close Redis subscriber:", error);
  } finally {
    subscriber = null;
    ioServer = null;
  }
};
