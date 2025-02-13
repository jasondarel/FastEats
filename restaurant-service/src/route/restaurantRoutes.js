import express from 'express';
const router = express.Router();
import { 
    createRestaurantController,
    getRestaurantController,
    getRestaurantsController,
    getRestaurantByOwnerIdController,
    updateRestaurantController,
    deleteRestaurantController
} from '../controller/restaurantControllers.js';

router.get("/", (req, res) => {
    res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"}`);
  });

router.get("/protected", (req, res) => {
    res.json({ message: "You accessed a protected route!", user: req.user });
  });

  router.post("/restaurant", createRestaurantController);
  router.put("/restaurant/:restaurantId", updateRestaurantController)
  router.delete("/restaurant/:restaurantId", deleteRestaurantController)
  router.get("/restaurants", getRestaurantsController);
  router.get("/restaurant/:restaurantId", getRestaurantController)
  router.get("/restaurant-owner/:ownerId", getRestaurantByOwnerIdController)

export {router as restaurantRoutes};