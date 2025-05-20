import express from "express";
import cors from "cors";
import { chatRoutes } from "./route/chatRoutes.js";
import { initializeCollections } from "./config/collectionsInit.js";
import { connectDatabase, testDatabase } from "./config/dbInit.js";
// import { menuRoutes } from "./route/menuRoutes.js";
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import path from 'path';
import logger from "./config/loggerInit.js";
import envInit from "./config/envInit.js";

envInit();
logger.info(`Using ${process.env.NODE_ENV} mode`);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();
app.use(express.json());

app.use(express.urlencoded({ extended: true }));
const PORT = process.env.PORT;

app.use(cors({
  origin: [process.env.CLIENT_URL], 
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

// app.use("/uploads/menu", express.static(path.join(__dirname, "uploads", "menu")));
// app.use("/uploads/restaurant", express.static(path.join(__dirname, "uploads", "restaurant")));


app.use("/", chatRoutes);


(async () => {
  try {
    await connectDatabase();
    await testDatabase();
    await initializeCollections();
    
    logger.info("✅ Database, Redis, and RabbitMQ initialized successfully");

    app.listen(PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    logger.error("❌ Error initializing services:", error);
  }
})();
