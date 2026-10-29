import { test } from "node:test";
import assert from "node:assert/strict";
import { pool } from "../lib/db";
import { researchSchema } from "../lib/content";
test("database constraints, draft isolation and revision history", async () => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");
    const result = await client.query(
      "SELECT r.* FROM research r JOIN companies c ON r.company_id=c.id WHERE c.slug='adani-ports'",
    );
    assert.equal(result.rowCount, 1);
    const row = result.rows[0];
    researchSchema.parse(row.published);
    const draft = { ...row.draft, description: "Private test draft" };
    await client.query("UPDATE research SET draft=$1 WHERE id=$2", [
      draft,
      row.id,
    ]);
    const check = await client.query(
      "SELECT draft,published FROM research WHERE id=$1",
      [row.id],
    );
    assert.equal(check.rows[0].draft.description, "Private test draft");
    assert.notEqual(check.rows[0].published.description, "Private test draft");
    const revisions = await client.query(
      "SELECT * FROM revisions WHERE research_id=$1",
      [row.id],
    );
    assert.ok(revisions.rowCount);
    await client.query("SAVEPOINT duplicate_check");
    await assert.rejects(
      () =>
        client.query(
          "INSERT INTO listings(id,company_id,exchange,symbol) SELECT 'duplicate-test',company_id,exchange,symbol FROM listings LIMIT 1",
        ),
      /unique constraint/,
    );
    await client.query("ROLLBACK TO SAVEPOINT duplicate_check");
    await client.query("ROLLBACK");
  } finally {
    client.release();
    await pool.end();
  }
});
