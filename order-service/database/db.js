import dotenv from "dotenv";
import pkg from "pg"; // Import default
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const { Pool } = pkg; // Ambil Pool dari import default

// Konversi __dirname agar bisa digunakan di ES Module
const __dirname = dirname(fileURLToPath(import.meta.url));

// Load file .env
dotenv.config({ path: resolve(__dirname, "../.env") });

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

// console.log("DB Config: ", {
//   //ngetes
//   user: process.env.DB_USER,
//   host: process.env.DB_HOST,
//   database: process.env.DB_NAME,
//   password: process.env.DB_PASSWORD ? "********" : "NOT SET",
//   port: process.env.DB_PORT,
// });

export default pool;
