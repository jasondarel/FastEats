import express from 'express';
const router = express.Router();
import authMiddleware from '../middleware/authMiddleware.js';
import multer from 'multer';
import path from 'path';

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

import { 
    createRestaurantController,
    getRestaurantController,
    getRestaurantsController,
    getRestaurantByOwnerIdController,
    getRestaurantByRestaurantIdController,
    updateRestaurantController,
    deleteRestaurantController
} from '../controller/restaurantControllers.js';
import { fileURLToPath } from 'url';

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

export {router as restaurantRoutes};