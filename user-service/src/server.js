import express from "express";
import cors from "cors";
import createTables from "./config/tablesinit.js";
import dotenv from "dotenv";
import userRoutes from "./route/userRoute.js";
import fileUpload from "express-fileupload"
import { rabbitMQInit } from "./config/rabbitMQInit.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5002;

app.use(cors(
  {
    origin: [
      "http://localhost:5173",
    ],
  }
));
app.use(fileUpload());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

app.use("/", userRoutes);

console.log(
  `${process.env.SERVICE_NAME || "User/Auth Service"} running on port ${PORT}`
);

createTables();
rabbitMQInit();

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
