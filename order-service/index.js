import logger from "./config/loggerInit.js";
import express from "express";
import cors from "cors";
import createTable from "./config/tableinit.js";
import OrderRoutes from "./routes/OrderRoutes.js";
import pool from "./config/db.js";
import envInit from "./config/envInit.js";

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(OrderRoutes);
createTable();


app.listen(PORT, () => {
  logger.info(`${process.env.SERVICE_NAME || "Service"} running on port ${PORT}`);
});
