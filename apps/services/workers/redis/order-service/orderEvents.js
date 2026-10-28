import envInit from "../../config/envInit.js";
envInit();
import { getRedisClient } from "../../config/redisInit.js";

export const SOCKET_EVENTS_CHANNEL =
  process.env.SOCKET_EVENTS_CHANNEL || "fasteats:order:events";

export const publishStatusChanged = async (order) => {
  const redis = getRedisClient();
  if (!redis) {
    throw new Error("Redis client unavailable");
  }

  const message = JSON.stringify({
    room: `order:${order.order_id}`,
    event: "order.status_changed",
    data: {
      order_id: order.order_id,
      status: order.status,
      updated_at: order.updated_at,
    },
  });

  await redis.publish(SOCKET_EVENTS_CHANNEL, message);
};
