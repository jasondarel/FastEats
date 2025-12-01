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
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

pool.on("connect", () => {
  logger.info("✅ Database connected successfully");
});

pool.on("error", (err) => {
  logger.error("❌ Unexpected database error:", err);
});

export default pool;
