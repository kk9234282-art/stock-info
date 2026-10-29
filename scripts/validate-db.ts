import assert from "node:assert/strict";
import { pool } from "../lib/db";
import { researchSchema } from "../lib/content";
try {
  const rows = await pool.query("SELECT draft,published FROM research");
  assert.ok(rows.rowCount);
  for (const r of rows.rows) {
    researchSchema.parse(r.draft);
    if (r.published) researchSchema.parse(r.published);
  }
  const invalid = await pool.query(
    "SELECT exchange,symbol,count(*) FROM listings GROUP BY exchange,symbol HAVING count(*)>1",
  );
  assert.equal(invalid.rowCount, 0);
  console.log(
    `Validated ${rows.rowCount} research records, source links and unique listings.`,
  );
} finally {
  await pool.end();
}
