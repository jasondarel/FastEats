import logger from "./src/config/loggerInit.js";
import express from "express";
import cors from "cors";
import OrderRoutes from "./src/routes/orderRoutes.js";
import envInit from "./src/config/envInit.js";
import createTables from "./src/config/tablesInit.js";
import { createDatabase, testDatabase } from "./src/config/dbInit.js";

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({ origin: process.env.CLIENT_URL }));
app.use(express.json());
app.use(OrderRoutes);


(async () => {
  try {
    await createDatabase();
    await testDatabase();
    await createTables();
    
    logger.info("✅ Database, Redis, and RabbitMQ initialized successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Error initializing services:", error);
  }
})();
