require("dotenv").config();
const express = require("express");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 5000;

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
