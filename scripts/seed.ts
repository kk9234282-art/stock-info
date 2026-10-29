import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import { db, pool } from "../lib/db";
import {
  companyTable,
  listingTable,
  researchTable,
  revisionTable,
} from "../lib/schema";
import { initialContent } from "../lib/content";
try {
  await db.transaction(async (tx) => {
    const [existing] = await tx
      .select()
      .from(companyTable)
      .where(eq(companyTable.slug, "adani-ports"));
    if (existing) return;
    const id = randomUUID(),
      rid = randomUUID();
    await tx
      .insert(companyTable)
      .values({
        id,
        slug: "adani-ports",
        name: "Adani Ports and Special Economic Zone Ltd.",
        sector: "Infrastructure · classification pending verification",
        industry: "Ports & logistics · classification pending verification",
      });
    await tx.insert(listingTable).values([
      {
        id: randomUUID(),
        companyId: id,
        exchange: "NSE",
        symbol: "ADANIPORTS",
      },
      { id: randomUUID(), companyId: id, exchange: "BSE", symbol: "532921" },
    ]);
    await tx
      .insert(researchTable)
      .values({
        id: rid,
        companyId: id,
        draft: initialContent,
        published: initialContent,
        version: 1,
      });
    await tx
      .insert(revisionTable)
      .values({
        id: randomUUID(),
        researchId: rid,
        version: 1,
        action: "prototype scaffold published",
        content: initialContent,
      });
  });
  console.log("One-company seed complete; existing research preserved.");
} finally {
  await pool.end();
}
