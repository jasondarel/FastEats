import pool from "./dbInit.js"; // Assuming you have a dbInit.js that exports your pool

const createTables = async () => {
  const client = await pool.connect();
  try {
    console.log("Creating tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL, -- Renamed from 'password' for consistency
        role TEXT NOT NULL DEFAULT 'user', -- Role field from auth_users
        address TEXT,
        created_at TIMESTAMP DEFAULT NOW()
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
