import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/dbInit.js";
import { restaurantRoutes } from "./route/restaurantRoutes.js";
import createTables from "./config/tablesInit.js";
import { menuRoutes } from "./route/menuRoutes.js";import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;
createTables();

app.use(cors({
  origin: ["http://localhost:5173"], 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());
app.use("/", restaurantRoutes);
app.use("/", menuRoutes);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));


app.listen(PORT, () => {
  console.log(`${process.env.SERVICE_NAME || "Service"} running on port ${PORT}`);
});
