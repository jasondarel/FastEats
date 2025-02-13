import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pool from "./config/dbInit.js";
import { restaurantRoutes } from "./route/restaurantRoutes.js";
import createTables from "./config/tablesInit.js";
import { menuRoutes } from "./route/menuRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;
createTables();

app.use(cors({
  origin: [], 
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

app.use(express.json());
app.use("/", restaurantRoutes);
app.use("/", menuRoutes);


app.listen(PORT, () => {
  console.log(`${process.env.SERVICE_NAME || "Service"} running on port ${PORT}`);
});
