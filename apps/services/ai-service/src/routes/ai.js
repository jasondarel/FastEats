import express from "express";
import rateLimit from "express-rate-limit";
import { postChatController } from "../controllers/aiController.js";

const aiRouter = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || "global",
});

aiRouter.use(limiter);
aiRouter.post("/chat", postChatController);

export default aiRouter;
