import {
  generateLoginToken,
  hashPassword,
  publishVerificationEmailMessage,
  generateOtpCode,
  generateRandomToken,
  publishResetPasswordEmailMessage,
} from "../util/userUtil.js";
import pool from "../config/dbInit.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  validateChangePasswordRequest, validateLoginRequest, 
  validateRegisterRequest, validateRegisterSellerRequest, validateResetPasswordRequest, validateUpdateProfileRequest, 
  validateUpdateUserPaymentRequest
} from "../validator/userValidator.js";
import { 
  becomeSellerService, 
  changePasswordService, 
  createUserDetailsService, 
  createUserPaymentService, 
  getCurrentUserService, 
  getUserByEmailService, 
  getUserByIdService, 
  getUserDetailsByIdService, 
  getUserPaymentByIdService, 
  getUsersService, 
  registerSellerService, 
  registerService, 
  updateUserDetailsService, 
  updateUserPaymentService, 
  validateUserService 
} from "../service/userService.js";
import { getRedisClient } from "../config/redisInit.js";
import logger from "../config/loggerInit.js";
import { responseError, responseSuccess } from "../util/responseUtil.js";
import envInit from "../config/envInit.js";
envInit();

const GLOBAL_SERVICE_URL = process.env.GLOBAL_SERVICE_URL;
const CLIENT_URL = process.env.CLIENT_URL;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../../restaurant-service/src/uploads/restaurant");
const blackListedTokens = new Set();

export const registerController = async (req, res) => {
  logger.info("REGISTER CONTROLLER");
  try {
    const errors = await validateRegisterRequest(req.body);
    if(Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return responseError(res, 400, "Validation failed", errors);
    }
    
    const hashedPassword = hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const response = await registerService(req.body);
    const otp = generateOtpCode(6);
    const emailVerificationToken = generateRandomToken(50);

    const redisKey = `email_verification:${req.body.email}`;

    const redisClient = getRedisClient();
    await redisClient.del(redisKey);
    await redisClient.hset(redisKey, {
      otp,
      token: emailVerificationToken,
      userId: response.id,
    });
    await redisClient.expire(redisKey, 300);

    // const redisData = await redisClient.hgetall(redisKey);

    const emailPayload = {
      email: req.body.email,
      token: emailVerificationToken,
      otp: otp,
    }

    await publishVerificationEmailMessage(emailPayload.email, emailPayload.token, emailPayload.otp);
    logger.info("User registered successfully");
    return responseSuccess(res, 201, response.message, "token", emailVerificationToken);
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const registerSellerController = async (req, res) => {
  logger.info("REGISTER SELLER CONTROLLER");
  try {
    await pool.query("BEGIN");
    const errors = await validateRegisterSellerRequest(req.body);
    if(Object.keys(errors).length > 0) {
      logger.warn("Validation failed ", errors);
      await pool.query("ROLLBACK");
      return responseError(res, 400, "Validation failed", "error", errors);
    }

    const hashedPassword = hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const response = await registerSellerService(req.body);
    if (!response) {
      logger.warn("Failed to register seller");
      await pool.query("ROLLBACK");
      return responseError(res, 400, "Failed to register seller");
    }
    const otp = generateOtpCode(6);
    const emailVerificationToken = generateRandomToken(50);

    const redisKey = `email_verification:${req.body.email}`;

    const redisClient = getRedisClient();
    await redisClient.del(redisKey);
    await redisClient.hset(redisKey, {
      otp,
      token: emailVerificationToken,
      userId: response.id,
    });
    await redisClient.expire(redisKey, 300);

    const emailPayload = {
      email: req.body.email,
      token: emailVerificationToken,
      otp: otp,
    }

    if(response.role === "seller") {
      if (!req.files || !req.files.restaurantImage) {
        logger.warn("Restaurant image is required");
        await pool.query("ROLLBACK");
        return responseError(res, 400, "Restaurant image is required");
      }
  
      const uploadedFile = req.files.restaurantImage;
  
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
  
      const fileExt = path.extname(uploadedFile.name);
      const safeFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
      const filePath = path.join(uploadDir, safeFileName);
  
      await uploadedFile.mv(filePath);
      const restaurantData = {
        ...req.body,
        ownerId: response.id,
        restaurantImage: safeFileName,
      };
  
      try {
        await axios.post(
          `${GLOBAL_SERVICE_URL}/restaurant/restaurant`,
          restaurantData,
        );
      } catch (err) {
        logger.error("Failed to create restaurant", err);
        await pool.query("ROLLBACK");
        return responseError(res, 400, err.response?.data?.error || "Failed to create restaurant");
      }
      await pool.query("COMMIT");
    } else {
      await pool.query("COMMIT");
    }
    await createUserPaymentService(response.id);
    logger.info("Seller registered successfully");
    await publishVerificationEmailMessage(emailPayload.email, emailPayload.token, emailPayload.otp);
    return responseSuccess(res, 201, response.message, "token", emailVerificationToken);
  } catch (err) {
    await pool.query("ROLLBACK");
    logger.error("Internal server error", err);
    if (err.response && err.response.status === 400) {
      logger.warn("Bad request", err.response.data.error);
      return responseError(res, 400, err.response.data.error);
    }
    return responseError(res, 500, "Server error");
  } 
};

export const loginController = async (req, res) => {
  logger.info("LOGIN CONTROLLER");
  try {
    const errors = await validateLoginRequest(req.body);

    if(errors.email === "Email is not verified") {
      const emailVerificationToken = generateRandomToken(50);
      const redisKey = `email_verification:${req.body.email}`;
      const redisClient = getRedisClient();
      const response = await getUserByEmailService(req.body.email);
      const otp = generateOtpCode(6);
      await redisClient.del(redisKey);
      await redisClient.hset(redisKey, {
        otp,
        token: emailVerificationToken,
        userId: response.id,
      });
      await redisClient.expire(redisKey, 300);
      
      if(!response) {
        logger.warn("Invalid credentials");
        return responseError(res, 400, "Invalid credentials");
      }
      
      const emailPayload = {
        email: req.body.email,
        token: emailVerificationToken,
        otp: otp,
      }
      await publishMessage(emailPayload.email, emailPayload.token, emailPayload.otp);
      logger.warn("Email is not verified");
      return responseError(res, 401, "Email is not verified", "token",  emailVerificationToken);
    }

    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return responseError(res, 400, "Validation failed", errors);
    }
    

    const user = await getUserByEmailService(req.body.email);
    if (!user) {
      logger.warn("Invalid credentials");
      return responseError(res, 400, "Invalid credentials");
    }

    const token = generateLoginToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    logger.info("Login successful");
    return responseSuccess(res, 200, "Login successful", "user", {
      name: user.name,
      email: user.email,
      role: user.role,
      token,
    });

  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const getUsersController = async (req, res) => {
  logger.info("GET USERS CONTROLLER");
  try {
    const result = await getUsersService();
    logger.info("Users found");
    return responseSuccess(res, 200, "Users found", "users", result);
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const verifyTokenController = async (req, res) => {
  logger.info("VERIFY TOKEN CONTROLLER");
  const {token, email} = req.query;
  if(!token) {
    logger.warn("Token not found");
    return responseError(res, 401, "Token not found");
  }
  if(!email) {
    logger.warn("Email not found");
    return responseError(res, 401, "Email not found");
  }
  const redisKey = `email_verification:${email}`;
  const redisClient = getRedisClient();
  const redisData = await redisClient.hgetall(redisKey);

  if(!redisData) {
    logger.warn("Token expired");
    return responseError(res, 401, "Token expired");
  }
  if(redisData.token !== token) {
    logger.warn("Invalid token");
    return responseError(res, 401, "Invalid token");
  }
}

export const verifyOtpController = async (req, res) => {
  logger.info("VERIFY OTP CONTROLLER");
  const { otp, token, email } = req.body;
  try {
    if(!otp) {
      logger.warn("OTP is required");
      return responseError(res, 400, "OTP is required");
    }
    if(!token) {
      logger.warn("Token is required");
      return responseError(res, 400, "Token is required");
    }
    if(!email) {
      logger.warn("Email is required");
      return responseError(res, 400, "Email is required");
    }

    const redisKey = `email_verification:${email}`;
    const redisClient = getRedisClient();
    const user = await redisClient.hgetall(redisKey);

    if (!user) {
      logger.warn("Invalid email");
      return responseError(res, 401, "Invalid email");
    }

    if (blackListedTokens.has(token)) {
      logger.warn("Token expired");
      return responseError(res, 401, "Token expired");
    }

    if (user.otp !== otp) {
      logger.warn("Invalid OTP");
      return responseError(res, 401, "Invalid OTP");
    }
    if(user.token !== token) {
      logger.warn("Invalid token");
      return responseError(res, 401, "Invalid token");
    }

    await validateUserService(user.userId);
    await createUserDetailsService({ user_id: user.userId });

    
    redisClient.del(redisKey);
    logger.info("Token verified successfully");
    return responseSuccess(res, 200, "Token verified successfully", "user", user);
  } catch (error) {
    logger.error("Internal server error", error);
    return responseError(res, 500, "Internal Server Error");
  }
};

export const getUserController = async (req, res) => {
  logger.info("GET USER CONTROLLER");
  const { id } = req.params;
  if (isNaN(id)) {
    logger.warn("User ID must be a number");
    return responseError(res, 400, "user ID must be a number");
  }
  try {
    const userQuery = await getUserByIdService(id);
    if (!userQuery) {
      logger.warn("User not found");
      return responseError(res, 404, "User not found");
    }
    const userDetailsQuery = await getUserDetailsByIdService(id);
    if (!userDetailsQuery) {
      logger.warn("User details not found");
      return responseError(res, 404, "User details not found");
    }
    logger.info("User found");
    return responseSuccess(res, 200, "User found", "user", {
      ...userQuery,
      ...userDetailsQuery,
    });
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const getCurrentUserController = async (req, res) => {
  logger.info("GET CURRENT USER CONTROLLER");
  const {userId} = req.user;
  try {
    const user = await getCurrentUserService(userId);
    if (!user) {
      logger.warn("User not found");
      return responseError(res, 404, "User not found");
    }
    logger.info("User found");
    return responseSuccess(res, 200, "User found", "user", user);
  } catch(err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Internal server error");
  }
}

export const getProfileController = async (req, res) => {
  logger.info("GET PROFILE CONTROLLER");
  const {userId} = req.user;
  try {
    const userQuery = await getUserByIdService(userId);
    if (!userQuery) {
      logger.warn("User not found");
      return responseError(res, 404, "User not found");
    }
    const userDetailsQuery = await getUserDetailsByIdService(userId);
    if (!userDetailsQuery) {
      logger.warn("User details not found");
      return responseError(res, 404, "User details not found");
    }
    logger.info("User found");
    return responseSuccess(res, 200, "User found", "user", {
      ...userQuery,
      ...userDetailsQuery,
    });
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Internal server error");
  }
};

export const updateProfileController = async (req, res) => {
  logger.info("UPDATE PROFILE CONTROLLER");
  const { userId } = req.user;
  try {
    const errors = await validateUpdateProfileRequest(req.body);
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return responseError(res, 400, "Validation failed", errors);
    }

    if(!req.body.address) {
      logger.warn("Address is empty");
      req.body.address = "";
    }

    if(!req.body.phoneNumber) {
      logger.warn("Phone number is empty");
      req.body.phoneNumber = "";
    }

    await updateUserDetailsService(req.body, userId);
    logger.info("Profile updated successfully");
    return responseSuccess(res, 200, "Profile updated successfully");
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const updateUserPaymentController = async (req, res) => {
  logger.info("UPDATE USER PAYMENT CONTROLLER");
  const {userId, role} = req.user;
  if(role !== "seller") {
    logger.warn("Only sellers can update payment details");
    return responseError(res, 400, "Only sellers can update payment details");
  }
  try {
    const errors = await validateUpdateUserPaymentRequest(req.body);
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return responseError(res, 400, "Validation failed", errors);
    }
    await updateUserPaymentService(req.body, userId);
    logger.info("Payment details updated successfully");
    return responseSuccess(res, 200, "Payment details updated successfully");
  } catch(err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const getUserPaymentController = async (req, res) => {
  logger.info("GET USER PAYMENT CONTROLLER");
  const {userId} = req.user;
  try {
    const user = await getUserPaymentByIdService(userId);
    if (!user) {
      logger.warn("User not found");
      return responseError(res, 404, "User not found");
    }
    logger.info("User found");
    return responseSuccess(res, 200, "User found", "user", user);
  } catch(err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const changePasswordController = async (req, res) => {
  logger.info("CHANGE PASSWORD CONTROLLER");
  const { newPassword } = req.body;
  const { userId } = req.user;
  try {
    const errors = await validateChangePasswordRequest(req.body, userId);
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return responseError(res, 400, "Validation failed", errors);
    }
    await changePasswordService(userId, hashPassword(newPassword));
    logger.info("Password changed successfully");
    return responseSuccess(res, 200, "Password changed successfully");
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const becomeSellerController = async (req, res) => {
  logger.info("BECOME SELLER CONTROLLER");
  const { userId, role } = req.user;
  try {
    if (role !== "user") {
      logger.warn("Only users can become sellers");
      return responseError(res, 400, "Only users can become sellers");
    }
    if (!req.files || !req.files.restaurantImage) {
      logger.warn("Restaurant image is required");
      return responseError(res, 400, "Restaurant image is required");
    }

    const uploadedFile = req.files.restaurantImage;

    if (!fs.existsSync(uploadDir)) {
      logger.warn("Upload directory does not exist, creating one");
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const fileExt = path.extname(uploadedFile.name);
    const safeFileName = `${Date.now()}-${Math.round(Math.random() * 1e9)}${fileExt}`;
    const filePath = path.join(uploadDir, safeFileName);

    await uploadedFile.mv(filePath);

    const restaurantData = {
      ...req.body,
      ownerId: req.user.userId,
      restaurantImage: safeFileName,
    };

    await axios.post(
      `${GLOBAL_SERVICE_URL}/restaurant/restaurant`,
      restaurantData,
      {
        headers: {
          Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`,
          "Content-Type": "application/json",
        },
      }
    );

    await becomeSellerService(userId);
    await createUserPaymentService(userId);
    logger.info("User upgraded to seller");
    return responseSuccess(res, 200, "User upgraded to seller", "restaurant", restaurantData);

  } catch (err) {
    if (err.response) {
      if (err.response.status === 401) {
        logger.error("Unauthorized access");
        return responseError(res, 401, err.response.data.message || "Unauthorized");
      } else if (err.response.status === 400) {
        logger.error("Bad request");
        return responseError(res, 400, err.response.data.message || "Bad request");
      }
    }
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
};

export const sendResetPasswordReqController = async(req, res) => {
  logger.info("SEND RESET PASSWORD REQUEST CONTROLLER");
  const { email } = req.body;
  try {
    if (!email) {
      logger.warn("Email is required");
      return responseError(res, 400, "Email is required");
    }
    
    const user = await getUserByEmailService(email);
    if (!user) {
      logger.warn("User not found");
      return responseError(res, 404, "User not found");
    }

    const resetToken = generateRandomToken(50);
    const redisKey = `password_reset:${resetToken}`;
    const redisClient = getRedisClient();
    
    await redisClient.del(redisKey);
    await redisClient.hset(redisKey, {
      token: resetToken,
      userId: user.id,
    });
    await redisClient.expire(redisKey, 300);

    const redisData = await redisClient.hgetall(redisKey);
    const emailPayload = {
      email: user.email,
      token: resetToken,
    };
    await publishResetPasswordEmailMessage(email, resetToken);
    
    logger.info("Reset email sent successfully");
    return responseSuccess(res, 200, "Reset email sent successfully. Please check your email to get the link.", "token", resetToken);
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
}

export const verifyResetPasswordTokenController = async (req, res) => {
  logger.info("VERIFY RESET PASSWORD TOKEN CONTROLLER");
  const { token } = req.query;
  if (!token) {
    logger.warn("Token not found");
    return responseError(res, 401, "Token not found");
  }

  const redisKey = `password_reset:${token}`;
  const redisClient = getRedisClient();

  const redisData = await redisClient.hgetall(redisKey);
  if (!redisData || Object.keys(redisData).length === 0) {
    logger.warn("Token expired or invalid email");
    return responseError(res, 401, "Token expired or invalid email");
  }

  if (redisData.token !== token) {
    logger.warn("Invalid token");
    return responseError(res, 401, "Invalid token");
  }
  logger.info("Token verified successfully");
  return responseSuccess(res, 200, "Token verified successfully", "userId", redisData.userId);
}

export const resetPasswordController = async (req, res) => {
  logger.info("RESET PASSWORD CONTROLLER");
  const { token } = req.query;
  const { password, passwordConfirmation } = req.body;
  if (!token) {
    logger.warn("Token not found");
    return responseError(res, 401, "Token not found");
  }
  
  try {
    const redisKey = `password_reset:${token}`;
    const redisClient = getRedisClient();
    const redisData = await redisClient.hgetall(redisKey);

    if (!redisData || Object.keys(redisData).length === 0) {
      logger.warn("Token expired or invalid email");
      return responseError(res, 401, "Token expired or invalid email");
    }

    if (redisData.token !== token) {
      logger.warn("Invalid token");
      return responseError(res, 401, "Invalid token");
    }

    const errors = await validateResetPasswordRequest({ password, passwordConfirmation, userId: redisData.userId });
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return responseError(res, 400, "Validation failed", "error", errors);
    }

    await changePasswordService(redisData.userId, hashPassword(password));
    await redisClient.del(redisKey);
    
    logger.info("Password reset successfully");
    return responseSuccess(res, 200, "Password reset successfully. You can now log in.");
  } catch (err) {
    logger.error("Internal server error", err);
    return responseError(res, 500, "Server error");
  }
}