const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Proxy requests to user-service
app.use(
  "/api/users",
  createProxyMiddleware({
    target: "http://localhost:5002", // User Service URL
    changeOrigin: true,
    pathRewrite: { "^/api/users": "" }, // Remove '/api/users' before forwarding
  })
);

// Proxy requests to restaurant-service
app.use(
  "/api/restaurants",
  createProxyMiddleware({
    target: "http://localhost:5003", // Restaurant Service URL
    changeOrigin: true,
    pathRewrite: { "^/api/restaurants": "" },
  })
);

// Proxy requests to order-service
app.use(
  "/api/orders",
  createProxyMiddleware({
    target: "http://localhost:5004", // Order Service URL
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "" },
  })
);

// Proxy requests to auth-service
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: "http://localhost:5001", // Auth Service URL
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
  })
);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`API Gateway running on port ${PORT}`);
});
