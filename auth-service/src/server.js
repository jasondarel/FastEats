const express = require("express");
const cors = require("cors");
const crypto = require("crypto");
const pool = require("./db");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5001;

// Function to hash passwords using SHA-256
function hashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

// Function to generate a simple base64 token
function generateToken(payload) {
  return Buffer.from(JSON.stringify(payload)).toString("base64");
}

// Function to verify a base64 token
function verifyToken(token) {
  try {
    return JSON.parse(Buffer.from(token, "base64").toString("utf8"));
  } catch (error) {
    return null;
  }
}

// Register a new user
app.post("/register", async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const hashedPassword = hashPassword(password);

  try {
    await pool.query(
      "INSERT INTO users (name, email, password) VALUES ($1, $2, $3)",
      [name, email, hashedPassword]
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
    const user = await pool.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);

    if (
      user.rows.length === 0 ||
      user.rows[0].password !== hashPassword(password)
    ) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = generateToken({
      userId: user.rows[0].id,
      name: user.rows[0].name,
    });
    res.json({ token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Protected route example
app.get("/profile", (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];
  const user = token ? verifyToken(token) : null;

  if (!user) return res.status(401).json({ error: "Unauthorized" });

  res.json({ message: "Welcome!", user });
});

app.listen(PORT, () => {
  console.log(`Auth Service running on port ${PORT}`);
});
