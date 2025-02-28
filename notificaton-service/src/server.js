import express from "express";
import "dotenv/config";
import startConsumer from "./service/user-service/emailValidationConsumer.js";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.send("📩 Email Verification Consumer Running...");
});

startConsumer();

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
