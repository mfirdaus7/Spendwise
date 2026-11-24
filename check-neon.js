import dotenv from "dotenv";
import pg from "pg";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const result = await pool.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = $1 ORDER BY table_name",
    ["public"]
  );

  console.log("Neon tables:", result.rows.map(row => row.table_name));
} catch (error) {
  console.error("Database query failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}