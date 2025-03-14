import pkg from "pg";
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const { Pool } = pkg;
const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

const testDatabase = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");
    logger.info("Database connected! Current time: ", res.rows[0].now);
    client.release();
  } catch (error) {
    logger.error("Database connection error:", error);
  }
};

testDatabase();

export default pool;
