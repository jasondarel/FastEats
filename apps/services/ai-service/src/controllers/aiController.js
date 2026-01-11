import { GoogleGenerativeAI } from "@google/generative-ai";
import systemPrompt from "../ai/systemPrompt.js";
import logger from "../config/loggerInit.js";

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
        return {
            error: `message content exceeds ${MAX_SINGLE_MESSAGE} characters`,
        };
        }
        normalized.push({ role, content: content.trim() });
    }

    return { messages: normalized };
};

const trimMessages = (messages) => {
    let totalChars = 0;
    const trimmed = [];

    for (
        let i = messages.length - 1;
        i >= 0 && trimmed.length < MAX_MESSAGES;
        i -= 1
    ) {
        const msg = messages[i];
        const nextTotal = totalChars + msg.content.length;
        if (nextTotal > MAX_TOTAL_CHARS) {
        break;
        }
        trimmed.unshift(msg);
        totalChars = nextTotal;
    }

    return trimmed;
}

export const postChatController = async (req, res) => {
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
        return res
        .status(400)
        .json({ error: "user or assistant messages required" });
    }

    try {
        const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: [systemPrompt, systemOverlays]
            .filter(Boolean)
            .join("\n\n"),
        });

        const result = await model.generateContent({ contents: chatHistory, generationConfig });
        const reply = result.response?.text?.() || "";

        if (!reply.trim()) {
        return res.status(500).json({ error: "empty response from model" });
        }

        return res.json({ reply });
    } catch (error) {
        logger.error("/api/ai/chat error", error);
        const status = error?.status === 429 ? 429 : 500;
        const message =
        status === 429
            ? "Assistant is temporarily unavailable (AI quota exceeded). Please retry shortly."
            : "Something went wrong. Please try again.";
        return res.status(status).json({ error: message });
    }
}