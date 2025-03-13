import dotenv from "dotenv";
const envFile = process.env.NODE_ENV === "production" ? ".env.prod" : ".env.dev";
dotenv.config({ path: envFile });


import pkg from "pg";
import logger from "./loggerInit.js";

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
