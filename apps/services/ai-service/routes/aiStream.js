import express from "express";
import rateLimit from "express-rate-limit";
import { GoogleGenerativeAI } from "@google/generative-ai";
import systemPrompt from "../ai/systemPrompt.js";

const aiStreamRouter = express.Router();

const limiter = rateLimit({
  windowMs: 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.ip || "global",
});

aiStreamRouter.use(limiter);

const MAX_MESSAGES = 12;
const MAX_TOTAL_CHARS = 8000;
const MAX_SINGLE_MESSAGE = 2000;

const generationConfig = {
  temperature: 0.4,
  topP: 0.8,
  maxOutputTokens: 512,
};

const getClient = () => {
  const key = process.env.GEMINI_API_KEY;
  if (!key) {
    return null;
  }
  return new GoogleGenerativeAI(key);
};

const asGeminiRole = (role) => (role === "assistant" ? "model" : "user");

const sanitizeMessages = (messages = []) => {
  if (!Array.isArray(messages)) {
    return { error: "messages must be an array" };
  }

  const normalized = [];

  for (const entry of messages) {
    if (!entry || typeof entry !== "object") {
      return { error: "each message must be an object" };
    }

    const { role, content } = entry;
    if (!role || !["user", "assistant", "system"].includes(role)) {
      return { error: "invalid message role" };
    }
    if (typeof content !== "string") {
      return { error: "message content must be a string" };
    }
    if (!content.trim()) {
      continue;
    }
    if (content.length > MAX_SINGLE_MESSAGE) {
      return { error: `message content exceeds ${MAX_SINGLE_MESSAGE} characters` };
    }
    normalized.push({ role, content: content.trim() });
  }

  return { messages: normalized };
};

const trimMessages = (messages) => {
  let totalChars = 0;
  const trimmed = [];

  for (let i = messages.length - 1; i >= 0 && trimmed.length < MAX_MESSAGES; i -= 1) {
    const msg = messages[i];
    const nextTotal = totalChars + msg.content.length;
    if (nextTotal > MAX_TOTAL_CHARS) {
      break;
    }
    trimmed.unshift(msg);
    totalChars = nextTotal;
  }

  return trimmed;
};

aiStreamRouter.post("/stream", async (req, res) => {
  const genAI = getClient();

  if (!genAI) {
    return res.status(500).json({ error: "AI service unavailable" });
  }

  const validation = sanitizeMessages(req.body?.messages);
  if (validation.error) {
    return res.status(400).json({ error: validation.error });
  }

  const trimmedMessages = trimMessages(validation.messages);
  if (!trimmedMessages.length) {
    return res.status(400).json({ error: "at least one message is required" });
  }

  const systemOverlays = trimmedMessages
    .filter((msg) => msg.role === "system")
    .map((msg) => msg.content)
    .join("\n\n");

  const chatHistory = trimmedMessages
    .filter((msg) => msg.role !== "system")
    .map((msg) => ({
      role: asGeminiRole(msg.role),
      parts: [{ text: msg.content }],
    }));

  if (!chatHistory.length) {
    return res.status(400).json({ error: "user or assistant messages required" });
  }

  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const heartbeat = setInterval(() => {
    res.write(": ping\n\n");
  }, 15000);

  const closeStream = () => {
    clearInterval(heartbeat);
    res.end();
  };

  req.on("close", closeStream);

  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: [systemPrompt, systemOverlays].filter(Boolean).join("\n\n"),
    });

    const result = await model.generateContent({ contents: chatHistory, generationConfig });
    const reply = result.response?.text?.() || "";

    if (!reply.trim()) {
      res.write("data: Unable to produce a response right now.\n\n");
      res.write("event: done\n");
      res.write("data: end\n\n");
      return closeStream();
    }

    const simulatedChunks = reply
      .split(/(?<=\.|!|\?|\n)\s+/)
      .map((chunk) => chunk.trim())
      .filter(Boolean);

    // TODO: replace simulated chunking with true SDK streaming once available.
    for (const chunk of simulatedChunks) {
      res.write(`data: ${chunk}\n\n`);
      await new Promise((resolve) => setTimeout(resolve, 40));
    }

    res.write("event: done\n");
    res.write("data: end\n\n");
    return closeStream();
  } catch (error) {
    console.error("/api/ai/stream error", error);
    const isQuota = error?.status === 429;
    const message = isQuota
      ? "Assistant is temporarily unavailable (AI quota exceeded). Please retry shortly."
      : "Something went wrong. Please try again.";
    res.write(`data: ${message}\n\n`);
    res.write("event: done\n");
    res.write("data: end\n\n");
    return closeStream();
  }
});

export default aiStreamRouter;
