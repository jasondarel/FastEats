import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';

dotenv.config();

const app = express();

const RESTAURANT_SERVICE_URL = process.env.RESTAURANT_SERVICE_URL || 'http://localhost:3001';
const USER_SERVICE_URL = process.env.USER_SERVICE_URL || 'http://localhost:3002';

console.log(RESTAURANT_SERVICE_URL);

// ✅ Middleware CORS untuk mengizinkan akses dari localhost:5173
app.use(cors({
    origin: 'http://localhost:5173', // Hanya izinkan akses dari React di localhost:5173
    methods: ['GET', 'POST', 'PUT', 'DELETE'], // Atur metode HTTP yang diizinkan
    allowedHeaders: ['Content-Type', 'Authorization'], // Atur header yang diizinkan
    credentials: true // Izinkan cookies jika diperlukan
}));

// ✅ Middleware Debugging untuk cek request masuk
app.use((req, res, next) => {
    console.log(`🔹 Received request: ${req.method} ${req.url}`);
    next();
});

// ✅ Konfigurasi Proxy Middleware
const proxyOptions = {
    changeOrigin: true,
    secure: false,
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
