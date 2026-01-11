import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import logger from "./config/loggerInit.js";
import envInit from "./config/envInit.js";
import cors from "cors";
import http from "http";

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const app = express();
const server = http.createServer(app);

app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.DOMAIN_URL],
    credentials: true,
  })
);

logger.info(`PORT: ${process.env.PORT}`);
logger.info(`RESTAURANT_SERVICE_URL: ${process.env.RESTAURANT_SERVICE_URL}`);
logger.info(`USER_SERVICE_URL: ${process.env.USER_SERVICE_URL}`);
logger.info(`ORDER_SERVICE_URL: ${process.env.ORDER_SERVICE_URL}`);
logger.info(
  `NOTIFICATION_SERVICE_URL: ${process.env.NOTIFICATION_SERVICE_URL}`
);

const restaurantProxy = createProxyMiddleware({
  target: process.env.RESTAURANT_SERVICE_URL || "http://localhost:5003",
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(
      `Restaurant Service - Proxying request: ${req.method} ${req.originalUrl}`
    );
  },
  onProxyRes: (proxyRes, req) => {
    logger.info(
      `Restaurant Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`
    );
  },
  onError: (err, req, res) => {
    logger.error(`Restaurant Service - Proxy error: ${err.message}`);
    res
      .status(500)
      .json({ error: "Restaurant Service Proxy error", details: err.message });
  },
});

const userProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || "http://localhost:5002",
  changeOrigin: false,
  headers: {
    "X-Forwarded-Host": process.env.DOMAIN_URL || process.env.CLIENT_URL,
    "X-Forwarded-Proto": "https",
  },
  onProxyReq: (proxyReq, req) => {
    proxyReq.setHeader("X-Original-Host", req.get("Host"));
    proxyReq.setHeader("X-Forwarded-For", req.ip);
    logger.info(
      `User Service - Proxying request: ${req.method} ${req.originalUrl}`
    );
  },
  onProxyRes: (proxyRes, req) => {
    logger.info(
      `User Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`
    );
  },
  onError: (err, req, res) => {
    logger.error(`User Service - Proxy error: ${err.message}`);
    res
      .status(500)
      .json({ error: "User Service Proxy error", details: err.message });
  },
});

const orderProxy = createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || "http://localhost:5004",
  changeOrigin: true,
  pathRewrite: (path, req) => {
    if (path.startsWith("/order/socket.io")) {
      return path.replace("/order", "");
    }
    return path;
  },
  onProxyReq: (proxyReq, req) => {
    logger.info(
      `Order Service - Proxying request: ${req.method} ${req.originalUrl}`
    );
  },
  onProxyRes: (proxyRes, req) => {
    logger.info(
      `Order Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`
    );
  },
  onError: (err, req, res) => {
    logger.error(`Order Service - Proxy error: ${err.message}`);
    res
      .status(500)
      .json({ error: "Order Service Proxy error", details: err.message });
  },
});

const notificationProxy = createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5005",
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    logger.info(
      `Notification Service - Proxying request: ${req.method} ${req.originalUrl}`
    );
  },
  onProxyRes: (proxyRes, req) => {
    logger.info(
      `Notification Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`
    );
  },
  onError: (err, req, res) => {
    logger.error(`Notification Service - Proxy error: ${err.message}`);
    res.status(500).json({
      error: "Notification Service Proxy error",
      details: err.message,
    });
  },
});

const chatProxy = createProxyMiddleware({
  target: process.env.CHAT_SERVICE_URL || "http://localhost:5005",
  changeOrigin: true,
  pathRewrite: (path, req) => {
    if (path.startsWith("/chat/socket.io")) {
      return path.replace("/chat", "");
    }
    return path;
  },
  onProxyReq: (proxyReq, req) => {
    logger.info(
      `Chat Service - Proxying request: ${req.method} ${req.originalUrl}`
    );
  },
  onProxyRes: (proxyRes, req) => {
    logger.info(
      `Chat Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`
    );
  },
  onError: (err, req, res) => {
    logger.error(`Chat Service - Proxy error: ${err.message}`);
    res
      .status(500)
      .json({ error: "Chat Service Proxy error", details: err.message });
  },
});

const aiProxy = createProxyMiddleware({
  target: process.env.AI_SERVICE_URL || "http://localhost:5055",
  changeOrigin: true,
});

app.use("/ai", aiProxy);
app.use("/restaurant", restaurantProxy);
app.use("/user", userProxy);
app.use("/order", orderProxy);
app.use("/notification", notificationProxy);
app.use("/chat", chatProxy);
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    services: {
      restaurant: process.env.RESTAURANT_SERVICE_URL || "http://localhost:5003",
      user: process.env.USER_SERVICE_URL || "http://localhost:5002",
      order: process.env.ORDER_SERVICE_URL || "http://localhost:5004",
      notification:
        process.env.NOTIFICATION_SERVICE_URL || "http://localhost:5005",
      chat: process.env.CHAT_SERVICE_URL || "http://localhost:5006",
    },
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info("Available routes:");
  logger.info("- /restaurant/* -> Restaurant Service");
  logger.info("- /user/* -> User Service");
  logger.info("- /order/* -> Order Service");
  logger.info("- /health -> Gateway Health Check");
  logger.info("- /notification/* -> Notification Service");
  logger.info("- /chat/* -> Chat Service");
});

server.on("upgrade", (req, socket, head) => {
  if (req.url.startsWith("/chat")) {
    chatProxy.upgrade(req, socket, head);
  } else if (req.url.startsWith("/order")) {
    orderProxy.upgrade(req, socket, head);
  }
});
