import pool from "./dbInit.js";

const createTables = async () => {
  const client = await pool.connect();
  try {
    console.log("Creating tables...");
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
        bank_bca TEXT UNIQUE NOT NULL, 
        gopay TEXT UNIQUE NOT NULL,
        dana TEXT UNIQUE NOT NULL,
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    console.log("✅ Tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    client.release();
  }
};

export default createTables;
