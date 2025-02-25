import pool from "./db.js";

const createTable = async () => {
  const client = await pool.connect();
  try {
    console.log("Creating Table...");

    await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
            order_id SERIAL PRIMARY KEY,
            user_id INT,
            menu_id INT,
            restaurant_id INT,
            item_quantity INT DEFAULT 1,
            status TEXT DEFAULT 'Waiting', -- 'Waiting', 'Preparing', 'Delivering', 'Completed', 'Cancelled'
            created_at TIMESTAMP DEFAULT NOW(),
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

export default createTable;
