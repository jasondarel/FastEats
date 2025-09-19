import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRouter from "./routes/ai.js";
import aiStreamRouter from "./routes/aiStream.js";
import logger from "./src/config/loggerInit.js";

dotenv.config();

const app = express();

const allowedOrigins = (process.env.CLIENT_URL || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins.length ? allowedOrigins : undefined,
    credentials: true,
  })
);

app.use(express.json({ limit: "1mb" }));

app.use("/api/ai", aiRouter);
app.use("/ai", aiRouter);
app.use("/api/ai", aiStreamRouter);
app.use("/ai", aiStreamRouter);
app.use(aiRouter);
app.use(aiStreamRouter);

app.get("/api/ai/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

const PORT = process.env.AI_SERVER_PORT || process.env.PORT || 5055;
const server = app.listen(PORT, () => {
  logger.info(`AI assistant server running on port ${PORT}`);
});

const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Closing AI assistant server...`);
  server.close(() => {
    logger.info("AI assistant server closed");
    process.exit(0);
  });
};

["SIGINT", "SIGTERM", "SIGUSR2"].forEach((signal) => {
  process.on(signal, () => gracefulShutdown(signal));
});

export default app;