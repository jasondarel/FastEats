import express from 'express';
const router = express.Router();
import { 
    createMenuController,
    getMenusController,
    getMenuController,
    updateMenuController,
    deleteMenuController
} from '../controller/menuController.js';

router.post("/menu", createMenuController);
router.get("/menus", getMenusController);
router.get("/menu/:menuId", getMenuController);
router.put("/menu", updateMenuController);
router.delete("/menu/:menuId", deleteMenuController);

export {router as menuRoutes};