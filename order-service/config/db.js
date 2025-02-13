import dotenv from "dotenv";
import pkg from "pg"; // Import default
import path from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg; // Ambil Pool dari import default

// Konversi __dirname agar bisa digunakan di ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load file .env
dotenv.config({ path: path.resolve(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD ? String(process.env.DB_PASSWORD) : "",
  port: process.env.DB_PORT || 5432,
});

const testDatabase = async () => {
  try {
    const client = await pool.connect();
    const res = await client.query("SELECT NOW()");

    console.log("Database connected! Current time: ", res.rows[0].now);
    client.release();
  } catch (error) {
    console.error("Database connection error:", error);
  }
};

testDatabase();

export default pool;
