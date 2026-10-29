import { readFile } from "node:fs/promises";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../lib/db";
import { importTable } from "../lib/schema";
import { stageRows, batchDigest } from "../lib/import";
async function main() {
  const [file, source, rights] = process.argv.slice(2);
  if (!file || !source || rights !== "--rights-confirmed")
    throw Error(
      "Usage: npm run import:stage -- file.json source-description --rights-confirmed. Confirm permission before staging.",
    );
  const rows: unknown = JSON.parse(await readFile(file, "utf8"));
  if (!Array.isArray(rows) || rows.length > 500)
    throw Error("Provide a JSON array of at most 500 rows");
  const summary = stageRows(rows),
    digest = batchDigest(source, rows);
  await db
    .insert(importTable)
    .values({
      id: randomUUID(),
      digest,
      source,
      rows: summary.accepted,
      summary: {
        accepted: summary.accepted.length,
        rejected: summary.rejected,
      },
      status: "staged",
    })
    .onConflictDoNothing({ target: importTable.digest });
  const [batch] = await db
    .select()
    .from(importTable)
    .where(eq(importTable.digest, digest));
  console.log(
    JSON.stringify(
      {
        batch: batch.id,
        status: batch.status,
        accepted: summary.accepted.length,
        rejected: summary.rejected,
      },
      null,
      2,
    ),
  );
}
main()
  .catch((e) => {
    console.error(e.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
