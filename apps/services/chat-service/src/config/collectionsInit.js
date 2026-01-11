import mongoose from "mongoose";
import logger from "./loggerInit.js";
import { connectDatabase } from "./dbInit.js";
import { Chat, Message } from "./schema.js";

const CONSTANTS = {
  INQUIRY_ORDER_ID: -999,
};

export const initializeCollections = async () => {
  try {
    logger.info("Initializing MongoDB collections...");

    if (mongoose.connection.readyState !== 1) {
      await connectDatabase();
    }

    const collections = await mongoose.connection.db
      .listCollections()
      .toArray();
    const collectionNames = collections.map((c) => c.name);

    logger.info(`Available collections: ${collectionNames.join(", ")}`);
    logger.info("✅ MongoDB collections initialized successfully!");

    return true;
  } catch (error) {
    logger.error("❌ Error initializing MongoDB collections:", error);
    return false;
  }
};