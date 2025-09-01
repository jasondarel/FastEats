import express from "express";
import cors from "cors";
import userRoutes from "./route/userRoute.js";
import fileUpload from "express-fileupload";
import { rabbitMQInit } from "./config/rabbitMQInit.js";
import { redisInit } from "./config/redisInit.js";
import logger from "./config/loggerInit.js";
import envInit from "./config/envInit.js";
import { createDatabase, testDatabase } from "./config/dbInit.js";
import session from 'express-session';
import passport from './config/passportInit.js';

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const app = express();
const PORT = process.env.PORT || 5002;

app.use(
  cors({
    origin: [process.env.CLIENT_URL, process.env.DOMAIN_URL],
  })
);
app.use(fileUpload());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: { secure: false }
}));
app.use(passport.initialize());
app.use(passport.session());
app.use("/", userRoutes);
logger.info(`${process.env.SERVICE_NAME || "User/Auth Service"} running on port ${PORT}`);

(async () => {
  try {
    await createDatabase();
    await testDatabase();
    await redisInit();
    await rabbitMQInit();
    logger.info("✅ Database, Redis, and RabbitMQ initialized successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Error initializing services:", error);
  }
})();