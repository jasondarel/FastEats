import express from "express";

import { 
    getRestaurantsController 
} from "../controllers/restaurantController.js";

const restaurantRouter = express.Router();

restaurantRouter.get("/restaurants", getRestaurantsController);

export default restaurantRouter;