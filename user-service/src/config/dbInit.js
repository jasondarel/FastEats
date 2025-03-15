import pkg from "pg";
const { Client, Pool } = pkg;
import logger from "./loggerInit.js";
import envInit from "./envInit.js";

envInit();

const dbName = process.env.DB_NAME;
const client = new Client({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: "postgres",
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : "",
  port: process.env.DB_PORT ? Number(process.env.DB_PORT) : 5432,
});

const createDatabase = async () => {
  try {
    await client.connect();
    const checkDbQuery = `SELECT 1 FROM pg_database WHERE datname='${dbName}'`;
    const res = await client.query(checkDbQuery);
    
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${dbName}"`);
      console.log(`Database "${dbName}" created successfully.`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
  } catch (err) {
    console.error("Error creating database:", err);
  } finally {
    await client.end();
  }
};

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: dbName,
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

export default pool;
export { createDatabase, testDatabase };