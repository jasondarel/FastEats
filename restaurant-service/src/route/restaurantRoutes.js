import express from 'express';
import authMiddleware from '../middleware/authMiddleware.js';
import { 
    createRestaurantController,
    getRestaurantController,
    getRestaurantsController,
    getRestaurantByOwnerIdController,
    getRestaurantByRestaurantIdController,
    updateRestaurantController,
    deleteRestaurantController,
    updateOpenRestaurantController,
    createRestaurantRatingController
} from '../controller/restaurantControllers.js';
import { fileURLToPath } from 'url';
import multerUpload from '../config/multerInit.js';

const __filename = fileURLToPath(import.meta.url);
const uploadLocation = "../uploads/restaurant";
const upload = multerUpload(__filename, uploadLocation);

const router = express.Router();

router.get("/", (req, res) => {
    res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"}`);
});
router.post("/restaurant",  createRestaurantController);
router.put("/restaurant", authMiddleware, upload.single("restaurantImage"), updateRestaurantController)
router.delete("/restaurant/:restaurantId", authMiddleware, deleteRestaurantController)
router.get("/restaurants", authMiddleware, getRestaurantsController);
router.get("/restaurant", authMiddleware, getRestaurantController)
router.get("/restaurant/:restaurantId", authMiddleware, getRestaurantByRestaurantIdController)
router.get("/restaurant-owner/:ownerId", authMiddleware, getRestaurantByOwnerIdController)
router.patch("/is-open", authMiddleware, updateOpenRestaurantController)
router.post("/rate", authMiddleware, createRestaurantRatingController)

export {router as restaurantRoutes};