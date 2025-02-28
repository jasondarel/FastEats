import {
  generateLoginToken,
  generateValidationEmailToken,
  hashPassword,
  validatePassword,
  publishMessage,
  validatePhoneNumber,
  generateOtpCode,
} from "../util/userUtil.js";
import pool from "../config/dbInit.js";
import axios from "axios";
import fs from "fs";
import path from "path";
import jwt from "jsonwebtoken";
import { fileURLToPath } from "url";
import { validateLoginRequest, validateRegisterRequest } from "../validator/userValidator.js";
import { getUserByEmailService, registerService, validateUserService } from "../service/userService.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadDir = path.resolve(__dirname, "../../../restaurant-service/src/uploads/restaurant");
const blackListedTokens = new Set();

const registerController = async (req, res) => {
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

    const otp = generateOtpCode(6);

    const emailVericationToken = generateValidationEmailToken({
      email: req.body.email,
      otp: otp,
    });


    const response = await registerService(req.body);

    const emailPayload = {
      email: req.body.email,
      token: emailVericationToken,
      otp: otp,
    }

    await publishMessage(emailPayload.email, emailPayload.token, emailPayload.otp);

    return res.status(201).json({
      success: true,
      message: response.message,
      token: emailVericationToken,
    })
  } catch (err) {
    console.error(err);
    res.status(500).json({ 
      success: false,
      message: "Server error",
    });
  }
};

const loginController = async (req, res) => {
  try {
    const errors = await validateLoginRequest(req.body);
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

const getUsersController = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

export const verifyTokenController = async (req, res) => {
  const authHeader = req.headers.authorization;
  const token = authHeader.split(" ")[1];

  if(!token) {
    return res.status(401).json({
      success: false,
      message: "Token not found",
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if(err) {
      return res.status(401).json({
        success: false,
        message: "Invalid token",
      });
    }

    res.json({
      success: true,
      message: "Token is valid",
    });
  })
}

export const verifyOtpController = async (req, res) => {
  try {
    const { otp } = req.body;
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: No token provided",
      });
    }

    const token = authHeader.split(" ")[1];
    if (blackListedTokens.has(token)) {
      return res.status(401).json({
        success: false,
        message: "Token has been revoked. Please login again",
      });
    }

    const user = await new Promise((resolve, reject) => {
      jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
        if (err) reject(err);
        else resolve(decoded);
      });
    });

    if (user.otp !== otp) {
      console.log("Invalid OTP");
      return res.status(401).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    const response = await validateUserService(user.email);

    blackListedTokens.add(token);

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

const getUserController = async (req, res) => {
  const { id } = req.params;

  if (isNaN(id)) {
    return res.status(400).json({ error: "User ID must be a number" });
  }

  try {
    const userQuery = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [id]
    );

    if (userQuery.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const userDetailsQuery = await pool.query(
      "SELECT profile_photo, address, phone_number FROM user_details WHERE user_id = $1",
      [id]
    );

    const user = userQuery.rows[0];
    const userDetails = userDetailsQuery.rows[0] || {};

    res.json({ user: { ...user, ...userDetails } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const getProfileController = async (req, res) => {
  try {
    const userQuery = await pool.query(
      "SELECT id, name, email, role FROM users WHERE id = $1",
      [req.user.userId]
    );

    if (userQuery.rows.length === 0)
      return res.status(404).json({ error: "User not found" });

    const userDetailsQuery = await pool.query(
      "SELECT profile_photo, address, phone_number FROM user_details WHERE user_id = $1",
      [req.user.userId]
    );

    const user = userQuery.rows[0];
    const userDetails = userDetailsQuery.rows[0] || {};

    res.json({ user: { ...user, ...userDetails } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const updateProfileController = async (req, res) => {
  const { name, profile_photo, address, phone_number } = req.body;

  if (!name) {
    return res.status(400).json({ error: "Name is required" });
  }

  if (phone_number && !validatePhoneNumber(phone_number)) {
    return res
      .status(400)
      .json({ error: "Phone number must be exactly 12 digits" });
  }

  try {
    // Update the `users` table (for name)
    await pool.query("UPDATE users SET name = $1 WHERE id = $2", [
      name,
      req.user.userId,
    ]);

    // Update the `user_details` table
    await pool.query(
      `INSERT INTO user_details (user_id, profile_photo, address, phone_number, updated_at)
       VALUES ($1, $2, $3, $4, NOW())
       ON CONFLICT (user_id) DO UPDATE 
       SET profile_photo = EXCLUDED.profile_photo, 
           address = EXCLUDED.address, 
           phone_number = EXCLUDED.phone_number, 
           updated_at = NOW();`,
      [req.user.userId, profile_photo, address, phone_number]
    );

    res.json({ message: "Profile updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const changePasswordController = async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: "All fields are required" });
  }

  try {
    const user = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.user.userId]
    );
    if (
      user.rows.length === 0 ||
      user.rows[0].password_hash !== hashPassword(currentPassword)
    ) {
      return res.status(401).json({ error: "Incorrect current password" });
    }

    if (!validatePassword(newPassword)) {
      return res.status(400).json({
        error:
          "Password must be at least 8 characters long, and include both letters and numbers",
      });
    }

    const hashedNewPassword = hashPassword(newPassword);
    await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
      hashedNewPassword,
      req.user.userId,
    ]);

    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const becomeSellerController = async (req, res) => {
  try {
    if (req.user.role !== "user") {
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

    console.log("Restaurant Data:", restaurantData);

    const response = await axios.post(
      "http://localhost:5000/restaurant/restaurant",
      restaurantData,
      {
        headers: {
          Authorization: `Bearer ${req.headers.authorization.split(" ")[1]}`,
          "Content-Type": "application/json",
        },
      }
    );

    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [
      "seller",
      req.user.userId,
    ]);

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

    console.error("❌ Error in becomeSellerController:", err);
    return res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};



const checkUserExistController = async (req, res) => {
  const id = req.params.id;
  try {
    const user = await pool.query("SELECT * FROM users WHERE id = $1", [id]);
    if (user.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: "User not found",
      });
    }
    res.json({
      success: true,
      message: "User found",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      error: "Server error",
    });
  }
};

export {
  registerController,
  loginController,
  getProfileController,
  updateProfileController,
  getUserController,
  getUsersController,
  changePasswordController,
  becomeSellerController,
  checkUserExistController,
};
