
import dotenv from "dotenv";
import pg from "pg";
import fs from "node:fs";

dotenv.config({ path: ".env.local" });

const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

try {
  const schema = fs.readFileSync("backend/schema.sql", "utf8");

  await pool.query(schema);

  console.log("SpendWise schema imported successfully!");
} catch (error) {
  console.error("Schema import failed:", error.message);
  process.exitCode = 1;
} finally {
  await pool.end();
}
