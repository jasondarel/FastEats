const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send(`User Service is running on port ${PORT}`);
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

app.listen(PORT, () => {
  console.log(`User Service running on port ${PORT}`);
});
