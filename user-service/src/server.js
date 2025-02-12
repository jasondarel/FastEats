const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`Welcome to ${process.env.SERVICE_NAME || "Service"}`);
});

app.listen(PORT, () => {
  console.log(
    `${process.env.SERVICE_NAME || "Service"} running on port ${PORT}`
  );
});

// Get all users
app.get("/users", async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM users");
    res.json(result.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// Middleware to verify token
app.use((req, res, next) => {
  if (req.path === "/") return next(); // Allow health check

  const token = req.headers.authorization?.split(" ")[1];
  const user = token ? verifyToken(token) : null;

  if (!user) return res.status(401).json({ error: "Unauthorized" });

  req.user = user;
  next();
});
