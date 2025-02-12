const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret";

// Function to hash passwords using SHA-256
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Function to generate JWT
function generateToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1h" });
}

// Middleware to authenticate JWT
function authenticateToken(req, res, next) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ error: "Forbidden" });
    req.user = user;
    next();
  });
}

// Register a new user
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const hashedPassword = hashPassword(password);

  try {
    await pool.query(
      "INSERT INTO auth_users (email, password_hash, role) VALUES ($1, $2, $3)",
      [email, hashedPassword, "user"]
    );
    res.json({ message: "User registered" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login user
app.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  try {
    const user = await pool.query("SELECT * FROM auth_users WHERE email = $1", [
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

// Get user profile (protected route)
app.get("/profile", authenticateToken, (req, res) => {
  res.json({ message: "Welcome!", user: req.user });
});

// Upgrade user to seller role (protected route)
app.post("/become-seller", authenticateToken, async (req, res) => {
  if (req.user.role !== "user") {
    return res.status(400).json({ error: "Only users can become sellers" });
  }

  try {
    await pool.query("UPDATE auth_users SET role = $1 WHERE id = $2", [
      "seller",
      req.user.userId,
    ]);
    res.json({ message: "User upgraded to seller" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
