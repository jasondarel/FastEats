import express from "express";
import { 
    getProfileController,
    loginController,
    registerController, 
    updateProfileController,
    changePasswordController,
    getUsersController,
    getUserController,
    becomeSelerController
} from "../controller/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const userRoutes = express.Router()

userRoutes.post("/register", registerController);
userRoutes.post("/login", loginController);
userRoutes.get("/profile", authenticateToken, getProfileController);
userRoutes.put("/profile", authenticateToken, updateProfileController);
userRoutes.get("/users", getUsersController);
userRoutes.get("/user/:id", getUserController);
userRoutes.put("/change-password", authenticateToken, changePasswordController);
userRoutes.post("/become-seller", authenticateToken, becomeSelerController)


export default userRoutes;