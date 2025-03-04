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
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { 
  validateChangePasswordRequest, validateLoginRequest, 
  validateRegisterRequest, validateUpdateProfileRequest 
} from "../validator/userValidator.js";
import { 
  becomeSellerService, 
  changePasswordService, 
  createUserDetailsService, 
  getCurrentUserService, 
  getUserByEmailService, 
  getUserByIdService, 
  getUserDetailsByIdService, 
  registerService, 
  updateUserDetailsService, 
  validateUserService 
} from "../service/userService.js";
import { getRedisClient } from "../config/redisInit.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../../restaurant-service/src/uploads/restaurant");
const blackListedTokens = new Set();

export const registerController = async (req, res) => {
  try {
    const errors = await validateRegisterRequest(req.body);
    if(Object.keys(errors).length > 0) {
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

    return res.status(201).json({
      success: true,
      message: response.message,
      token: emailVerificationToken,
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
    });
  }
};

export const loginController = async (req, res) => {
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

      return res.status(401).json({
        success: false,
        message: "Email is not verified",
        token: emailVerificationToken,
      })
    }

    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    

    const user = await getUserByEmailService(req.body.email);
    if (!user) {
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
    
    res.json({
      success: true,
      message: "Login successful",
      token,
    })

  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

export const getUsersController = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyTokenController = async (req, res) => {
  const {token, email} = req.query;

  if(!token) {
    return res.status(401).json({
      success: false,
      message: "Token not found",
    });
  }

  if(!email) {
    return res.status(401).json({
      success: false,
      message: "Email not found",
    });
  }
  const redisKey = `email_verification:${email}`;
  const redisClient = getRedisClient();
  const redisData = await redisClient.hgetall(redisKey);

  if(!redisData) {
    return res.status(401).json({
      success: false,
      message: "Token expired",
    });
  }

  if(redisData.token !== token) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
}

export const verifyOtpController = async (req, res) => {
  const { otp, token, email } = req.body;
  try {
    if(!otp) {
      return res.status(400).json({
        success: false,
        message: "OTP is required",
      });
    }

    if(!token) {
      return res.status(400).json({
        success: false,
        message: "Token is required",
      });
    }

    if(!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    const redisKey = `email_verification:${email}`;
    const redisClient = getRedisClient();
    const user = await redisClient.hgetall(redisKey);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email",
      });
    }

    if (blackListedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: "Token expired",
      });
    }

    if (user.otp !== otp) {
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }
    
    if(user.token !== token) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    await validateUserService(user.userId);
    await createUserDetailsService({ user_id: user.userId });

    
    redisClient.del(redisKey);

    return res.status(200).json({
      success: true,
      message: "Token verified successfully",
      user,
    });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    return res.status(500).json({
      success: false,
      message: "Internal Server Error",
    });
  }
};

export const getUserController = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({
      success: false,
      message: "user ID must be a number",
    })
  }

  try {
    const userQuery = await getUserByIdService(id);
    if (!userQuery) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userDetailsQuery = await getUserDetailsByIdService(id);
    if (!userDetailsQuery) {
      return res.status(404).json({
        success: false,
        message: "User details not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found",
      user: {
        ...userQuery,
        ...userDetailsQuery,
      }
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
};

export const getCurrentUserController = async (req, res) => {
  const {userId} = req.user;
  try {
    const user = await getCurrentUserService(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      user,
    })
  } catch(err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
}

export const getProfileController = async (req, res) => {
  const {userId} = req.user;
  try {
    const userQuery = await getUserByIdService(userId);
    if (!userQuery) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const userDetailsQuery = await getUserDetailsByIdService(userId);
    if (!userDetailsQuery) {
      return res.status(404).json({
        success: false,
        message: "User details not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User found",
      user: {
        ...userQuery,
        ...userDetailsQuery,
      }
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
};

export const updateProfileController = async (req, res) => {
  const { userId } = req.user;
  try {
    const errors = await validateUpdateProfileRequest(req.body);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }

    if(!req.body.address) {
      req.body.address = "";
    }

    if(!req.body.phoneNumber) {
      req.body.phoneNumber = "";
    }

    await updateUserDetailsService(req.body, userId);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully",
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
};

export const changePasswordController = async (req, res) => {
  const { newPassword } = req.body;
  const { userId } = req.user;

  try {
    const errors = await validateChangePasswordRequest(req.body, userId);
    if (Object.keys(errors).length > 0) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors,
      });
    }
    
    await changePasswordService(userId, hashPassword(newPassword));

    return res.status(200).json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (err) {
    console.error(err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    })
  }
};

export const becomeSellerController = async (req, res) => {
  const { userId, role } = req.user;

  try {
    if (role !== "user") {
      return res.status(400).json({
        success: false,
        message: "Only users can become sellers",
      });
    }

    if (!req.files || !req.files.restaurantImage) {
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

    return res.status(200).json({
      success: true,
      message: "User upgraded to seller",
      restaurant: restaurantData,
    });

  } catch (err) {
    if (err.response) {
      if (err.response.status === 401) {
        return res.status(401).json(err.response.data);
      } else if (err.response.status === 400) {
        console.log(err.response.data);
        return res.status(400).json(err.response.data);
      }
    }

    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};