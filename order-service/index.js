import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import createTable from "./config/tableinit.js";
import OrderRoutes from "./routes/OrderRoutes.js";
import logger from "./config/loggerInit.js";

const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: envFile });
logger.info(`Using ${envFile} file`);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL,
}));

app.use(express.json());

app.use(OrderRoutes);

createTable();

app.listen(PORT, () => {
  logger.info(
    `${process.env.SERVICE_NAME || "Service"} running on port ${PORT}`
  );
});