import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
const globalDb = globalThis as unknown as { pool?: Pool };
export const pool =
  globalDb.pool ??
  new Pool({ connectionString: process.env.DATABASE_URL, max: 5 });

export const db = drizzle(pool);

if (!globalDb.pool)
  pool.on("error", () =>
    console.error(
      "An idle PostgreSQL connection closed. New requests will reconnect.",
    ),
  );

if (process.env.NODE_ENV !== "production") globalDb.pool = pool;
