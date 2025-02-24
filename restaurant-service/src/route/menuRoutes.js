import express from "express";
import authMiddleware from "../middleware/authMiddleware.js";
const router = express.Router();
import {
    createMenuController,
    getMenusController,
    getMenuByMenuIdController,
    updateMenuController,
    deleteMenuController,
    getMenuByRestoIdController,
    updateAvailableMenuController
} from "../controller/menuController.js";
import { fileURLToPath } from "url";
import multerUpload from "../config/multerInit.js";

const __filename = fileURLToPath(import.meta.url);
const uploadLocation = "../uploads/menu";
const upload = multerUpload(__filename, uploadLocation);

router.post("/menu", authMiddleware, upload.single("menuImage"), createMenuController);
router.get("/menus", authMiddleware, getMenusController);
router.get("/menu/:restaurantId", authMiddleware, getMenuByRestoIdController);
router.get("/menu-by-id/:menuId", authMiddleware, getMenuByMenuIdController);
router.put("/menu/:menuId", authMiddleware, upload.single("menuImage"), updateMenuController);
router.put("/update-available/:menuId", authMiddleware, updateAvailableMenuController);
router.delete("/menu/:menuId", authMiddleware, deleteMenuController);

export { router as menuRoutes };
