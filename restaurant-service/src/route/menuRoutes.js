import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
const router = express.Router();
import { 
    createMenuController,
    getMenusController,
    getMenuController,
    updateMenuController,
    deleteMenuController
} from '../controller/menuController.js';

router.post("/menu", authMiddleware, createMenuController);
router.get("/menus", authMiddleware, getMenusController);
router.get("/menu/:menuId", authMiddleware, getMenuController);
router.put("/menu", authMiddleware, updateMenuController);
router.delete("/menu/:menuId", authMiddleware, deleteMenuController);

export {router as menuRoutes};