import pool from "./dbInit.js";
import logger from "./loggerInit.js";

const createTables = async () => {
  const client = await pool.connect();
  try {
    logger.info("Creating tables...");
    await client.query(`
      
    `);

    logger.info("✅ Tables created successfully!");
  } catch (error) {
    logger.error("❌ Error creating tables:", error);
  } finally {
    client.release();
  }
};

export default createTables;
