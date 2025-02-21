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
        is_open BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS menu_item (
        menu_id SERIAL PRIMARY KEY,
        menu_name VARCHAR(255) NOT NULL,
        menu_description TEXT,
        menu_image VARCHAR(500),
        restaurant_id INT NOT NULL,
        menu_category VARCHAR(255) NOT NULL,
        is_available BOOLEAN DEFAULT FALSE,
        menu_price DECIMAL(10, 2) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id) ON DELETE CASCADE
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
