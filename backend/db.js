import pg from "pg";
import dotenv from "dotenv";

dotenv.config({ path: "backend/.env" });

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  // Enable this only when your hosted PostgreSQL provider requires SSL:
  // ssl: { rejectUnauthorized: false },
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});