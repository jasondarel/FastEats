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
    verifyTokenController,
    verifyOtpController,
    getCurrentUserController,
    registerSellerController,
    updateUserPaymentController,
    getUserPaymentController,
    sendResetPasswordReqController,
    verifyResetPasswordTokenController,
    resetPasswordController
} from "../controller/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multerUpload from "../config/multerInit.js";
import {fileURLToPath} from "url";
import passport from '../config/passportInit.js';
import { googleAuthController, googleCallbackController } from "../controller/userController.js";

const __filename = fileURLToPath(import.meta.url);
const uploadLocation = "../uploads/profile";
const upload = multerUpload(__filename, uploadLocation);

const userRoutes = express.Router()

userRoutes.post("/register", registerController);
userRoutes.post("/register/seller", registerSellerController);
userRoutes.post("/login", loginController);
userRoutes.get("/profile", authMiddleware, getProfileController);
userRoutes.put("/profile", authMiddleware, updateProfileController);
userRoutes.get("/user", authMiddleware, getCurrentUserController);
userRoutes.get("/users", authMiddleware, getUsersController);
userRoutes.get("/user/:id", getUserController);
userRoutes.put("/change-password", authMiddleware, changePasswordController);
userRoutes.post("/become-seller", authMiddleware, becomeSellerController)
userRoutes.get("/verify-token", verifyTokenController);
userRoutes.post("/verify-otp", verifyOtpController);
userRoutes.get("/user-payment", authMiddleware, getUserPaymentController);
userRoutes.put("/user-payment", authMiddleware, updateUserPaymentController);
userRoutes.post("/send-reset-password-req", sendResetPasswordReqController);
userRoutes.get("/verify-reset-password-token", verifyResetPasswordTokenController);
userRoutes.post("/reset-password", resetPasswordController);
userRoutes.get("/auth/google", googleAuthController);
userRoutes.get("/auth/google/callback", 
  passport.authenticate('google', { 
    failureRedirect: `${process.env.CLIENT_URL}/auth/google/error` 
  }),
  (req, res, next) => {
    console.log("PASSPORT SUCCESS ✅");
    next();
  },
  googleCallbackController
);

export default userRoutes;