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
            total_price DECIMAL(10, 2) NOT NULL,
            status TEXT DEFAULT 'pending', -- 'pending', 'preparing', 'delivered',
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

export default createTable;
