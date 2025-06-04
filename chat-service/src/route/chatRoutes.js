import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
    getChatsController,
    createChatController,
    getChatByIdController,
    createMessageController,
    getMessageController,
    uploadImageChatController
} from '../controller/chatControllers.js';
import multerMiddleware from '../middleware/multerMiddleware.js';

const router = express.Router();

router.get("/", (req, res) => {
    res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"} Service`);
});

router.get("/chats", authMiddleware, getChatsController);
router.post("/chat", authMiddleware, createChatController);
router.post("/upload-image", authMiddleware, multerMiddleware("image"), uploadImageChatController);
router.get("/chat/:chat_id", authMiddleware, getChatByIdController);

router.post("/message", authMiddleware, createMessageController);
router.get("/message", authMiddleware, getMessageController);

export {router as chatRoutes};