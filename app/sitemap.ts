import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { companyTable, researchTable } from "@/lib/schema";
import { eq, isNotNull } from "drizzle-orm";
export const dynamic = "force-dynamic";
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL ?? "http://localhost:3000";
  const rows = await db
    .select({ slug: companyTable.slug, content: researchTable.published })
    .from(companyTable)
    .innerJoin(researchTable, eq(companyTable.id, researchTable.companyId))
    .where(isNotNull(researchTable.published));
  return [
    { url: base },
    { url: base + "/companies" },
    ...rows
      .filter((c) => c.content?.sources.length)
      .map((c) => ({ url: base + "/companies/" + c.slug })),
  ];
}
