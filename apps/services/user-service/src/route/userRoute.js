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
    resetPasswordController,
    completeGoogleRegistrationController,
    googleAuthController, 
    googleCallbackController,
    logoutController,
    getTokenExpirationController
} from "../controller/userController.js";
import authMiddleware from "../middleware/authMiddleware.js";
import multerUpload from "../config/multerInit.js";
import {fileURLToPath} from "url";
import passport from '../config/passportInit.js';

const __filename = fileURLToPath(import.meta.url);
const uploadLocation = "../uploads/profile";
const upload = multerUpload(__filename, uploadLocation);

const userRoutes = express.Router()

userRoutes.post("/register", registerController);
userRoutes.post("/register/seller", registerSellerController);
userRoutes.post("/login", loginController);
userRoutes.post("/logout", authMiddleware, logoutController);
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
userRoutes.get("/auth/google/callback", (req, res, next) => {
  passport.authenticate('google', (err, user, info) => {
    if (err) {
      console.error('Passport authentication error:', err);
      return res.redirect(`${process.env.CLIENT_URL}/auth/google/error`);
    }
    
    if (!user) {
      console.log("No user returned from passport");
      return res.redirect(`${process.env.CLIENT_URL}/auth/google/error`);
    }
    
    if (user.isNewUser) {
      console.log("New user detected, redirecting to registration");
      const googleData = encodeURIComponent(JSON.stringify(user.googleProfile));
      return res.redirect(`${process.env.CLIENT_URL}/register-google?data=${googleData}`);
    }
    
    req.logIn(user, (loginErr) => {
      if (loginErr) {
        console.error('Login error:', loginErr);
        return res.redirect(`${process.env.CLIENT_URL}/auth/google/error`);
      }
      
      googleCallbackController(req, res);
    });
  })(req, res, next);
});

userRoutes.post("/register/google", completeGoogleRegistrationController);

export default userRoutes;