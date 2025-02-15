import express from "express";

import { 
    loginController,
    homeProfileController 
} from "../controllers/userController.js";

const userRouter = express.Router();

userRouter.post("/login", loginController);
userRouter.get("/profile", homeProfileController)

export default userRouter;