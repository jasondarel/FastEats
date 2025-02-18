import {
  generateToken,
  hashPassword,
  validateEmail,
  validatePassword,
  validatePhoneNumber,
} from "../util/userUtil.js";
import pool from "../config/dbInit.js";
import axios from "axios";

const registerController = async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }

  if (!validatePassword(password)) {
    return res.status(400).json({
      error:
        "Password must be at least 8 characters long, also must include letters and numbers",
    });
  }

  const hashedPassword = hashPassword(password);

  try {
    await pool.query(
      "INSERT INTO users (name, email, password_hash, role) VALUES ($1, $2, $3, $4)",
      [name, email, hashedPassword, "user"]
    );
    res.json({ message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
};

const loginController = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  if (!validateEmail(email)) {
    return res.status(400).json({ error: "Invalid email format" });
  }
  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (
      user.rows.length === 0 ||
      user.rows[0].password_hash !== hashPassword(password)
    ) {
      return res.status(401).json({
        success: false,
        message: "Wrong email or password.",
      });
    }

    const token = generateToken({
      userId: user.rows[0].id,
      email: user.rows[0].email,
      role: user.rows[0].role,
    });
    res.json({ token });
  } catch (err) {
    console.log("kena error");
    console.error(err);
    res.status(500).json({ error: "Server error" });
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

    const restaurantData = req.body;
    restaurantData.ownerId = req.user.userId;

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
      restaurant: response.data,
    });
  } catch (err) {
    if (err.response) {
      if (err.response.status === 401) {
        return res.status(401).json(err.response.data);
      } else if (err.response.status === 400) {
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
