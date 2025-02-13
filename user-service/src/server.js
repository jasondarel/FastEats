import express from "express";
import cors from "cors";
import crypto from "crypto";
import jwt from "jsonwebtoken";
import pool from "./config/dbinit.js"; // Change from require to import
import createTables from "./config/tablesinit.js"; // Change from require to import
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

app.use(cors());
app.use(express.json({ limit: "10mb" })); // Increase JSON request limit
app.use(express.urlencoded({ limit: "10mb", extended: true })); // Increase form data limit

console.log(
  `${process.env.SERVICE_NAME || "User/Auth Service"} running on port ${PORT}`
);

// Call createTables to ensure the tables are created if they don't exist
createTables();

// 🔹 Hash Password
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// 🔹 Generate JWT Token
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// 🔹 Middleware: Verify Token
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
}

// 🔹 Register User
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

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
});

// 🔹 Login User
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (
      user.rows.length === 0 ||
      user.rows[0].password_hash !== hashPassword(password)
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      userId: user.rows[0].id,
      email: user.rows[0].email,
      role: user.rows[0].role,
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Get User Profile (Protected)
// 🔹 Get User Profile (Protected) - Now includes user_details
app.get("/profile", authenticateToken, async (req, res) => {
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
    const userDetails = userDetailsQuery.rows[0] || {}; // If no details yet, return empty object

    res.json({ user: { ...user, ...userDetails } });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Update User Profile (Protected)
app.put("/profile", authenticateToken, async (req, res) => {
  const { profile_photo, address, phone_number } = req.body;

  try {
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
});

// 🔹 Upgrade to Seller (Protected)
app.post("/become-seller", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(400).json({ error: "Only users can become sellers" });
  }

  try {
    await pool.query("UPDATE users SET role = $1 WHERE id = $2", [
      "seller",
      req.user.userId,
    ]);
    res.json({ message: "User upgraded to seller" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// 🔹 Get All Users (Admin Feature)
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
