import express from "express";
import rateLimit from "express-rate-limit";
import { postStreamController } from "../controllers/aiStreamController.js";

const aiStreamRouter = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || "global",
});

aiStreamRouter.use(limiter);
aiStreamRouter.post("/stream", postStreamController);

export default aiStreamRouter;
