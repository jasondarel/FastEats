import express from 'express';
const router = express.Router();
import { 
    createRestaurantController
} from '../controller/restaurantControllers.js';

router.get("/", (req, res) => {
    res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"}`);
  });

router.get("/protected", (req, res) => {
    res.json({ message: "You accessed a protected route!", user: req.user });
  });

  router.post("/create-restaurant", createRestaurantController)

export {router as restaurantRoutes};