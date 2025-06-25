import pool from "./dbInit.js";
import logger from "./loggerInit.js";

const createTables = async () => {
  const client = await pool.connect();
  try {
    logger.info("Creating Table...");

    await client.query(`
      CREATE TABLE IF NOT EXISTS carts (
          cart_id SERIAL PRIMARY KEY,
          user_id INT NOT NULL,
          restaurant_id INT NOT NULL,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          UNIQUE (user_id, restaurant_id)
      );
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS cart_items (
          cart_item_id SERIAL PRIMARY KEY,
          cart_id INT NOT NULL,
          menu_id INT NOT NULL,
          quantity INT DEFAULT 1,
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW(),
          FOREIGN KEY (cart_id) REFERENCES carts(cart_id) ON DELETE CASCADE
      );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS orders (
            order_id SERIAL PRIMARY KEY,
            user_id INT,
            menu_id INT,
            restaurant_id INT,
            item_quantity INT DEFAULT 1,
            status TEXT DEFAULT 'Waiting', -- 'Waiting', 'Pending', 'Preparing', 'Delivering', 'Completed', 'Cancelled'
            order_type TEXT DEFAULT 'CHECKOUT', -- 'CHECKOUT', 'CART'
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
        );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS order_jobs (
          id SERIAL PRIMARY KEY,
          payload JSONB NOT NULL,
          routing_key TEXT NOT NULL,
          status TEXT DEFAULT 'pending', -- 'pending', 'published', 'failed'
          created_at TIMESTAMP DEFAULT NOW(),
          updated_at TIMESTAMP DEFAULT NOW()
      );
    `);

    await client.query(`
        CREATE TABLE IF NOT EXISTS order_items (
            order_item_id SERIAL PRIMARY KEY,
            order_id INT NOT NULL,
            menu_id INT,
            item_quantity INT DEFAULT 1,
            FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
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
          shipping_province VARCHAR(50) DEFAULT 'unknown',
          shipping_city VARCHAR(50) DEFAULT 'unknown',
          shipping_district VARCHAR(50) DEFAULT 'unknown',
          shipping_village VARCHAR(50) DEFAULT 'unknown',
          shipping_address VARCHAR(255) DEFAULT 'unknown',
          shipping_phone VARCHAR(50) DEFAULT 'unknown',
          shipping_name VARCHAR(100) DEFAULT 'unknown',
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
        );`);

    logger.info("✅ Tables created successfully!");
  } catch (error) {
    logger.error("❌ Error creating tables:", error);
  } finally {
    client.release();
  }
};

export default createTables;
