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
} from "../controller/menuController.js";

router.post("/menu", authMiddleware, createMenuController);
router.get("/menus", authMiddleware, getMenusController);
router.get("/menu/:restaurantId", authMiddleware, getMenuByRestoIdController);
router.get("/menu-by-id/:menuId", authMiddleware, getMenuByMenuIdController);
router.put("/menu/:menuId", authMiddleware, updateMenuController);
router.delete("/menu/:menuId", authMiddleware, deleteMenuController);

export { router as menuRoutes };
