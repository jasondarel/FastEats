import pkg from "pg";
const { Pool } = pkg;
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : "",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

const testDatabase = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    logger.info("Database connected! Current time:", res.rows[0].now);
    client.release();
  } catch (err) {
    logger.error("Database connection error:", err);
  }
};

testDatabase();

export default pool;
