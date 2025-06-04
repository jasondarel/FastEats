import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
    getChatsController,
    createChatController,
    getChatByIdController,
    createMessageController,
    getMessageController
} from '../controller/chatControllers.js';
import { fileURLToPath } from 'url';
import multerUpload from '../middleware/multerMiddleware.js';

const __filename = fileURLToPath(import.meta.url);
const uploadLocation = "../uploads/chat";
const upload = multerUpload(__filename, uploadLocation);

const router = express.Router();

router.get("/", (req, res) => {
    res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"} Service`);
});

router.get("/chats", authMiddleware, getChatsController);
router.post("/chat", authMiddleware, upload.single("chatImage"), createChatController);
router.get("/chat/:chat_id", authMiddleware, getChatByIdController);

router.post("/message", authMiddleware, createMessageController);
router.get("/message", authMiddleware, getMessageController);

export {router as chatRoutes};