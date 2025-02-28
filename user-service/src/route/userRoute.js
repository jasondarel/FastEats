import express from "express";
import { 
    getProfileController,
    loginController,
    registerController, 
    updateProfileController,
    changePasswordController,
    getUsersController,
    getUserController,
    becomeSellerController,
    checkUserExistController,
    verifyTokenController,
    verifyOtpController,
} from "../controller/userController.js";
import { authenticateToken } from "../middleware/authMiddleware.js";

const userRoutes = express.Router()

userRoutes.post("/register", registerController);
userRoutes.post("/login", loginController);
userRoutes.get("/profile", authenticateToken, getProfileController);
userRoutes.put("/profile", authenticateToken, updateProfileController);
userRoutes.get("/users", authenticateToken, getUsersController);
userRoutes.get("/user/:id", authenticateToken, getUserController);
userRoutes.get("/is-user-exist/:id", checkUserExistController);
userRoutes.put("/change-password", authenticateToken, changePasswordController);
userRoutes.post("/become-seller", authenticateToken, becomeSellerController)
userRoutes.get("/verify-token", verifyTokenController);
userRoutes.post("/verify-otp", verifyOtpController);

export default userRoutes;