import { readFile } from "node:fs/promises";
import { pool } from "../lib/db";
const client = await pool.connect();
try {
  await client.query("BEGIN");
  await client.query("SELECT pg_advisory_xact_lock(424242)");
  await client.query(
    "CREATE TABLE IF NOT EXISTS schema_migrations (name text primary key, applied_at timestamptz not null default now())",
  );
  const name = "001_initial";
  const result = await client.query(
    "SELECT name FROM schema_migrations WHERE name=$1",
    [name],
  );
  if (!result.rowCount) {
    await client.query(await readFile("db/migrations/001_initial.sql", "utf8"));
    await client.query("INSERT INTO schema_migrations(name) VALUES($1)", [
      name,
    ]);
  }
  await client.query("COMMIT");
  console.log("Database migrations applied.");
} catch (e) {
  await client.query("ROLLBACK");
  throw e;
} finally {
  client.release();
  await pool.end();
}
