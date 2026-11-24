import pg from "pg";
import dotenv from "dotenv";

// Load Neon environment variables first.
dotenv.config({ path: ".env.local" });

// Fallback to local backend environment variables.
dotenv.config({ path: "backend/.env" });

const { Pool } = pg;

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

pool.on("error", (error) => {
  console.error("Unexpected PostgreSQL pool error:", error);
});
