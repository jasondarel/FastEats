import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
    
} from '../controller/chatControllers.js';
import { fileURLToPath } from 'url';
import multerUpload from '../config/multerInit.js';

const __filename = fileURLToPath(import.meta.url);
// const uploadLocation = "../uploads/chat";
// const upload = multerUpload(__filename, uploadLocation);

const router = express.Router();

router.get("/", (req, res) => {
    res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"} Service`);
});
// router.post("/restaurant",  createRestaurantController);
// router.put("/restaurant", authMiddleware, upload.single("chatImage"), updateRestaurantController)

export {router as chatRoutes};