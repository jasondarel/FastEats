import express from 'express';
const router = express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import { 
    createRestaurantController,
    getRestaurantController,
    getRestaurantsController,
    getRestaurantByOwnerIdController,
    getRestaurantByRestaurantIdController,
    updateRestaurantController,
    deleteRestaurantController,
    updateOpenRestaurantController
} from '../controller/restaurantControllers.js';
import { fileURLToPath } from 'url';
import multerUpload from '../config/multerInit.js';

const __filename = fileURLToPath(import.meta.url);
const uploadLocation = "../uploads/restaurant";
const upload = multerUpload(__filename, uploadLocation);

router.get("/", (req, res) => {
    res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"}`);
});
router.post("/restaurant", authMiddleware,  createRestaurantController);
router.put("/restaurant", authMiddleware, upload.single("restaurantImage"), updateRestaurantController)
router.delete("/restaurant/:restaurantId", authMiddleware, deleteRestaurantController)
router.get("/restaurants", authMiddleware, getRestaurantsController);
router.get("/restaurant", authMiddleware, getRestaurantController)
router.get("/restaurant/:restaurantId", authMiddleware, getRestaurantByRestaurantIdController)
router.get("/restaurant-owner/:ownerId", authMiddleware, getRestaurantByOwnerIdController)
router.patch("/is-open", authMiddleware, updateOpenRestaurantController)

export {router as restaurantRoutes};