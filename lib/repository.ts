import { and, eq, ilike, isNotNull, or, inArray, asc } from "drizzle-orm";
import { db } from "./db";
import { companyTable, listingTable, researchTable } from "./schema";
import { researchSchema } from "./content";
export async function companies(query = "", page = 1) {
  const listingIds = db
    .select({ id: listingTable.companyId })
    .from(listingTable)
    .where(ilike(listingTable.symbol, `%${query}%`));
  const rows = await db
    .select({ company: companyTable, research: researchTable })
    .from(companyTable)
    .innerJoin(researchTable, eq(researchTable.companyId, companyTable.id))
    .where(
      and(
        isNotNull(researchTable.published),
        query
          ? or(
              ilike(companyTable.name, `%${query}%`),
              ilike(companyTable.sector, `%${query}%`),
              ilike(companyTable.industry, `%${query}%`),
              inArray(companyTable.id, listingIds),
            )
          : undefined,
      ),
    )
    .orderBy(asc(companyTable.name))
    .limit(20)
    .offset((page - 1) * 20);
  const listings = rows.length
    ? await db
        .select()
        .from(listingTable)
        .where(
          inArray(
            listingTable.companyId,
            rows.map((r) => r.company.id),
          ),
        )
    : [];
  return rows.map((r) => ({
    ...r.company,
    research: r.research,
    listings: listings.filter((l) => l.companyId === r.company.id),
  }));
}
export async function company(slug: string) {
  const [r] = await db
    .select({ company: companyTable, research: researchTable })
    .from(companyTable)
    .innerJoin(researchTable, eq(researchTable.companyId, companyTable.id))
    .where(and(eq(companyTable.slug, slug), isNotNull(researchTable.published)))
    .limit(1);
  if (!r) return null;
  return {
    ...r.company,
    research: r.research,
    listings: await db
      .select()
      .from(listingTable)
      .where(eq(listingTable.companyId, r.company.id)),
    content: researchSchema.parse(r.research.published),
  };
}
