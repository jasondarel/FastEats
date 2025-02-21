import pool from "./dbInit.js";

const createTables = async () => {
  const client = await pool.connect();
  try {
    console.log("Creating tables...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS restaurants (
        restaurant_id SERIAL PRIMARY KEY,
        restaurant_name VARCHAR(255) NOT NULL,
        restaurant_address TEXT NOT NULL,
        restaurant_image VARCHAR(500),
        owner_id INT NOT NULL UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      ALTER TABLE menu_item 
      ADD COLUMN is_available BOOLEAN DEFAULT FALSE;
    `);

    console.log("✅ Tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    client.release();
  }
};

export default createTables;  