import express from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import dotenv from "dotenv";

dotenv.config();
const app = express();

// Debug logging
console.log("Loaded Environment Variables:");
console.log(`PORT: ${process.env.PORT}`);
console.log(`RESTAURANT_SERVICE_URL: ${process.env.RESTAURANT_SERVICE_URL}`);
console.log(`USER_SERVICE_URL: ${process.env.USER_SERVICE_URL}`);
console.log(`ORDER_SERVICE_URL: ${process.env.ORDER_SERVICE_URL}`);
console.log(`NOTIFICATION_SERVICE_URL: ${process.env.NOTIFICATION_SERVICE_URL}`);

// Restaurant service proxy
const restaurantProxy = createProxyMiddleware({
  target: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5003',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    console.log(`Restaurant Service - Proxying request: ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req) => {
    console.log(`Restaurant Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`Restaurant Service - Proxy error: ${err.message}`);
    res.status(500).json({ error: "Restaurant Service Proxy error", details: err.message });
  },
});

// User service proxy
const userProxy = createProxyMiddleware({
  target: process.env.USER_SERVICE_URL || 'http://localhost:5002',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    console.log(`User Service - Proxying request: ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req) => {
    console.log(`User Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`User Service - Proxy error: ${err.message}`);
    res.status(500).json({ error: "User Service Proxy error", details: err.message });
  },
});

// Order service proxy
const orderProxy = createProxyMiddleware({
  target: process.env.ORDER_SERVICE_URL || 'http://localhost:5004',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    console.log(`Order Service - Proxying request: ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req) => {
    console.log(`Order Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`Order Service - Proxy error: ${err.message}`);
    res.status(500).json({ error: "Order Service Proxy error", details: err.message });
  },
})

const notificationProxy = createProxyMiddleware({
  target: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005',
  changeOrigin: true,
  onProxyReq: (proxyReq, req) => {
    console.log(`Notification Service - Proxying request: ${req.method} ${req.originalUrl}`);
  },
  onProxyRes: (proxyRes, req) => {
    console.log(`Notification Service - Response received: ${req.originalUrl} -> Status ${proxyRes.statusCode}`);
  },
  onError: (err, req, res) => {
    console.error(`Notification Service - Proxy error: ${err.message}`);
    res.status(500).json({ error: "Notification Service Proxy error", details: err.message });
  },
})

// Apply proxy middleware for each service
app.use('/restaurant', restaurantProxy);
app.use('/user', userProxy);
app.use('/order', orderProxy);
app.use('/notification', notificationProxy);

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK',
    timestamp: new Date().toISOString(),
    services: {
      restaurant: process.env.RESTAURANT_SERVICE_URL || 'http://localhost:5003',
      user: process.env.USER_SERVICE_URL || 'http://localhost:5002',
      order: process.env.ORDER_SERVICE_URL || 'http://localhost:5004',
      notification: process.env.NOTIFICATION_SERVICE_URL || 'http://localhost:5005',
    }
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
  console.log('Available routes:');
  console.log('- /restaurant/* -> Restaurant Service');
  console.log('- /user/* -> User Service');
  console.log('- /order/* -> Order Service');
  console.log('- /health -> Gateway Health Check');
  console.log('- /notification/* -> Notification Service');
});