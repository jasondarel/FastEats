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
    deleteRestaurantController
} from '../controller/restaurantControllers.js';

  router.get("/", (req, res) => {
      res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"}`);
    });

  router.post("/restaurant", authMiddleware,  createRestaurantController);
  router.put("/restaurant", authMiddleware, updateRestaurantController)
  router.delete("/restaurant/:restaurantId", authMiddleware, deleteRestaurantController)
  router.get("/restaurants", authMiddleware, getRestaurantsController);
  router.get("/restaurant", authMiddleware, getRestaurantController)
  router.get("/restaurant/:restaurantId", authMiddleware, getRestaurantByRestaurantIdController)
  router.get("/restaurant-owner/:ownerId", authMiddleware, getRestaurantByOwnerIdController)

export {router as restaurantRoutes};