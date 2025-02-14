import express from 'express';
import dotenv from 'dotenv';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';

// ✅ Middleware Debugging untuk Cek Request Masuk
app.use((req, res, next) => {
    console.log(`🔹 Received request: ${req.method} ${req.url}`);
    next();
});

// ✅ Konfigurasi Proxy Middleware
const proxyOptions = {
    changeOrigin: true, // Mengubah host header ke target URL
    secure: false, // Matikan SSL verification jika perlu (misal untuk ngrok atau localhost)
    onProxyReq: (proxyReq, req, res) => {
        console.log(`🚀 Forwarding request: ${req.method} ${req.originalUrl}`);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log(`✅ Response received with status: ${proxyRes.statusCode}`);
    },
    onError: (err, req, res) => {
        console.error(`❌ Proxy error: ${err.message}`);
        res.status(500).json({ error: 'Proxy error', details: err.message });
    },
};

// ✅ Routing API Gateway dengan Proxy Middleware
app.use('/restaurant', createProxyMiddleware({ target: RESTAURANT_SERVICE_URL, ...proxyOptions }));
app.use('/user', createProxyMiddleware({ target: USER_SERVICE_URL, ...proxyOptions }));

// ✅ Menjalankan server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 API Gateway running on http://localhost:${PORT}`);
});
