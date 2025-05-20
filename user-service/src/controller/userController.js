import {
  generateLoginToken,
  hashPassword,
  publishMessage,
  generateOtpCode,
  generateRandomToken,
} from "../util/userUtil.js";
import pool from "../config/dbInit.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { 
  validateChangePasswordRequest, validateLoginRequest, 
  validateRegisterRequest, validateRegisterSellerRequest, validateUpdateProfileRequest, 
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
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
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

    const redisData = await redisClient.hgetall(redisKey);

    const emailPayload = {
      email: req.body.email,
      token: emailVerificationToken,
      otp: otp,
    }

    await publishMessage(emailPayload.email, emailPayload.token, emailPayload.otp);
    logger.info("User registered successfully");
    return res.status(201).json({
      success: true,
      message: response.message,
      token: emailVerificationToken,
    })
  } catch (err) {
    logger.error("Internal server error", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
    });
  }
};

export const registerSellerController = async (req, res) => {
  logger.info("REGISTER SELLER CONTROLLER");
  try {
    const errors = await validateRegisterSellerRequest(req.body);
    if(Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    const hashedPassword = hashPassword(req.body.password);
    req.body.password = hashedPassword;

    const response = await registerSellerService(req.body);
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

    await publishMessage(emailPayload.email, emailPayload.token, emailPayload.otp);

    if(response.role === "seller") {
      if (!req.files || !req.files.restaurantImage) {
        logger.warn("Restaurant image is required");
        return res.status(400).json({
          success: false,
          message: "Restaurant image is required",
        });
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
  
       await axios.post(
        "http://localhost:5000/restaurant/restaurant",
        restaurantData,
      );
    }
    await createUserPaymentService(response.id);
    logger.info("Seller registered successfully");
    return res.status(201).json({
      success: true,
      message: response.message,
      token: emailVerificationToken,
    })
  } catch (err) {
    logger.error("Internal server error", err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
    });
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
        return res.status(400).json({
          success: false,
          message: "Invalid credentials",
        });
      }

      const emailPayload = {
        email: req.body.email,
        token: emailVerificationToken,
        otp: otp,
      }
      await publishMessage(emailPayload.email, emailPayload.token, emailPayload.otp);
      logger.warn("Email is not verified");
      return res.status(401).json({
        success: false,
        message: "Email is not verified",
        token: emailVerificationToken,
      })
    }

    if (Object.keys(errors).length > 0) {
      console.log(errors);
      logger.warn("Validation failed", errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    

    const user = await getUserByEmailService(req.body.email);
    if (!user) {
      logger.warn("Invalid credentials");
      return res.status(400).json({
        success: false,
        message: "Invalid credentials",
      });
    }

    const token = generateLoginToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });
    
    logger.info("Login successful");
    return res.status(200).json({
      success: true,
      message: "Login successful",
      token,
    })

  } catch (err) {
    logger.error("Internal server error", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUsersController = async (req, res) => {
  logger.info("GET USERS CONTROLLER");
  try {
    const result = await getUsersService();
    logger.info("Users found");
    return res.status(200).json({
      success: true,
      users: result,
    })
  } catch (err) {
    logger.error("Internal server error", err);
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyTokenController = async (req, res) => {
  logger.info("VERIFY TOKEN CONTROLLER");
  const {token, email} = req.query;

  if(!token) {
    logger.warn("Token not found");
    return res.status(401).json({
      success: false,
      message: "Token not found",
    });
  }

  if(!email) {
    logger.warn("Email not found");
    return res.status(401).json({
      success: false,
      message: "Email not found",
    });
  }
  const redisKey = `email_verification:${email}`;
  const redisClient = getRedisClient();
  const redisData = await redisClient.hgetall(redisKey);

  if(!redisData) {
    logger.warn("Token expired");
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  if(redisData.token !== token) {
    logger.warn("Invalid token");
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}

export const verifyOtpController = async (req, res) => {
  logger.info("VERIFY OTP CONTROLLER");
  const { otp, token, email } = req.body;
  try {
    if(!otp) {
      logger.warn("OTP is required");
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    if(!token) {
      logger.warn("Token is required");
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    if(!email) {
      logger.warn("Email is required");
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const redisKey = `email_verification:${email}`;
    const redisClient = getRedisClient();
    const user = await redisClient.hgetall(redisKey);

    if (!user) {
      logger.warn("Invalid email");
      return res.status(401).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (blackListedTokens.has(token)) {
      logger.warn("Token expired");
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (user.otp !== otp) {
      logger.warn("Invalid OTP");
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    
    if(user.token !== token) {
      logger.warn("Invalid token");
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    await validateUserService(user.userId);
    await createUserDetailsService({ user_id: user.userId });

    
    redisClient.del(redisKey);
    logger.info("Token verified successfully");
    return res.status(200).json({
      success: true,
      message: "Token verified successfully",
      user,
    });
  } catch (error) {
    logger.error("Internal server error", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUserController = async (req, res) => {
  logger.info("GET USER CONTROLLER");
  const { id } = req.params;

  if (isNaN(id)) {
    logger.warn("User ID must be a number");
    return res.status(400).json({
      success: false,
      message: "user ID must be a number",
    })
  }

  try {
    const userQuery = await getUserByIdService(id);
    if (!userQuery) {
      logger.warn("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userDetailsQuery = await getUserDetailsByIdService(id);
    if (!userDetailsQuery) {
      logger.warn("User details not found");
      return res.status(404).json({
        success: false,
        message: "User details not found",
      });
    }

    logger.info("User found");
    return res.status(200).json({
      success: true,
      message: "User found",
      user: {
        ...userQuery,
        ...userDetailsQuery,
      }
    })
  } catch (err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
};

export const getCurrentUserController = async (req, res) => {
  logger.info("GET CURRENT USER CONTROLLER");
  const {userId} = req.user;
  try {
    const user = await getCurrentUserService(userId);
    if (!user) {
      logger.warn("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    logger.info("User found");
    return res.status(200).json({
      success: true,
      user,
    })
  } catch(err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
}

export const getProfileController = async (req, res) => {
  logger.info("GET PROFILE CONTROLLER");
  const {userId} = req.user;
  try {
    const userQuery = await getUserByIdService(userId);
    if (!userQuery) {
      logger.warn("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userDetailsQuery = await getUserDetailsByIdService(userId);
    if (!userDetailsQuery) {
      logger.warn("User details not found");
      return res.status(404).json({
        success: false,
        message: "User details not found",
      });
    }

    logger.info("User found");
    return res.status(200).json({
      success: true,
      message: "User found",
      user: {
        ...userQuery,
        ...userDetailsQuery,
      }
    })
  } catch (err) {
    logger.error("Internal server error", err);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    })
  }
};

export const updateProfileController = async (req, res) => {
  logger.info("UPDATE PROFILE CONTROLLER");
  const { userId } = req.user;
  try {
    const errors = await validateUpdateProfileRequest(req.body);
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
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
    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (err) {
    logger.error("Internal server error", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
};

export const updateUserPaymentController = async (req, res) => {
  logger.info("UPDATE USER PAYMENT CONTROLLER");
  const {userId, role} = req.user;
  if(role !== "seller") {
    logger.warn("Only sellers can update payment details");
    return res.status(400).json({
      success: false,
      message: "Only sellers can update payment details",
    });

  }
  try {
    const errors = await validateUpdateUserPaymentRequest(req.body);
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    await updateUserPaymentService(req.body, userId);
    logger.info("Payment details updated successfully");
    return res.status(200).json({
      success: true,
      message: "Payment details updated successfully",
    })
  } catch(err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUserPaymentController = async (req, res) => {
  logger.info("GET USER PAYMENT CONTROLLER");
  const {userId} = req.user;
  try {
    const user = await getUserPaymentByIdService(userId);
    if (!user) {
      logger.warn("User not found");
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    logger.info("User found");
    return res.status(200).json({
      success: true,
      user,
    })
  } catch(err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const changePasswordController = async (req, res) => {
  logger.info("CHANGE PASSWORD CONTROLLER");
  const { newPassword } = req.body;
  const { userId } = req.user;

  try {
    const errors = await validateChangePasswordRequest(req.body, userId);
    console.log(errors);
    if (Object.keys(errors).length > 0) {
      logger.warn("Validation failed", errors);
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    
    await changePasswordService(userId, hashPassword(newPassword));

    logger.info("Password changed successfully");
    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (err) {
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
};

export const becomeSellerController = async (req, res) => {
  logger.info("BECOME SELLER CONTROLLER");

  const { userId, role } = req.user;
  try {
    if (role !== "user") {
      logger.warn("Only users can become sellers");
      return res.status(400).json({
        success: false,
        message: "Only users can become sellers",
      });
    }

    if (!req.files || !req.files.restaurantImage) {
      logger.warn("Restaurant image is required");
      return res.status(400).json({
        success: false,
        message: "Restaurant image is required",
      });
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
      "http://localhost:5000/restaurant/restaurant",
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
    return res.status(200).json({
      success: true,
      message: "User upgraded to seller",
      restaurant: restaurantData,
    });

  } catch (err) {
    if (err.response) {
      if (err.response.status === 401) {
        logger.error("Unauthorized access");
        return res.status(401).json(err.response.data);
      } else if (err.response.status === 400) {
        logger.error("Bad request");
        return res.status(400).json(err.response.data);
      }
    }
    logger.error("Internal server error", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};