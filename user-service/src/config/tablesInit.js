import pool from "./dbInit.js";
import logger from "./loggerInit.js";

const createTables = async () => {
  const client = await pool.connect();
  try {
    logger.info("Creating tables...");
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        is_verified BOOLEAN DEFAULT FALSE,
        password_hash TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user', -- Role field from auth_users
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_details (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        profile_photo TEXT,
        address TEXT,
        phone_number TEXT,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS user_payments (
        user_id INTEGER PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
        bank_bca TEXT DEFAULT 1234567890, 
        gopay TEXT DEFAULT 1234567890,
        dana TEXT DEFAULT 1234567890,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    logger.info("✅ Tables created successfully!");
  } catch (error) {
    logger.error("❌ Error creating tables:", error);
  } finally {
    client.release();
  }
};

export default createTables;
