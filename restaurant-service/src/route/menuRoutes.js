import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
import multer from 'multer';
import path from 'path';
import {
    createMenuController,
    getMenusController,
    getMenuByMenuIdController,
    updateMenuController,
    deleteMenuController,
    getMenuByRestoIdController,
} from "../controller/menuController.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.join(__dirname, "../uploads");

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + "-" + file.originalname);
    },
});

const upload = multer({ storage });

router.post("/menu", authMiddleware, upload.single("menuImage"), createMenuController);
router.put("/menu-detail", authMiddleware, updateMenuController);
router.get("/menus", authMiddleware, getMenusController);
router.get("/menu/:restaurantId", authMiddleware, getMenuByRestoIdController);
router.get("/menu-by-id/:menuId", authMiddleware, getMenuByMenuIdController);
router.put("/menu/:menuId", authMiddleware, updateMenuController);
router.delete("/menu/:menuId", authMiddleware, deleteMenuController);

export { router as menuRoutes };
