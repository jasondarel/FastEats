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
            status TEXT DEFAULT 'Waiting', -- 'Waiting', 'Pending', 'Preparing', 'Completed', 'Cancelled'
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS transactions (
          transaction_id SERIAL PRIMARY KEY,
          order_id INT NOT NULL,
          currency VARCHAR(10),
          transaction_time TIMESTAMP,
          expiry_time TIMESTAMP,
          amount DECIMAL(15, 2),
          bank VARCHAR(50),
          va_number VARCHAR(50),
          payment_type VARCHAR(50),
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
      );
  `);

      await client.query(`
        CREATE TABLE IF NOT EXISTS snaps (
            snap_id SERIAL PRIMARY KEY,
            order_id INT NOT NULL,
            snap_token TEXT,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW(),
            FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
        );`)

    console.log("✅ Tables created successfully!");
  } catch (error) {
    console.error("❌ Error creating tables:", error);
  } finally {
    client.release();
  }
};

export default createTable;
