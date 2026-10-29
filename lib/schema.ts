import {
  pgTable,
  text,
  jsonb,
  integer,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/pg-core";
import type { ResearchContent } from "./content";
export const companyTable = pgTable(
  "companies",
  {
    id: text().primaryKey(),
    slug: text().notNull().unique(),
    name: text().notNull(),
    isin: text().unique(),
    sector: text(),
    industry: text(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [index("company_name_idx").on(t.name)],
);
export const listingTable = pgTable(
  "listings",
  {
    id: text().primaryKey(),
    companyId: text("company_id")
      .references(() => companyTable.id, { onDelete: "cascade" })
      .notNull(),
    exchange: text().notNull(),
    symbol: text().notNull(),
  },
  (t) => [
    uniqueIndex("listing_identity_idx").on(t.exchange, t.symbol),
    index("listing_company_idx").on(t.companyId),
  ],
);
export const researchTable = pgTable("research", {
  id: text().primaryKey(),
  companyId: text("company_id")
    .references(() => companyTable.id, { onDelete: "cascade" })
    .notNull()
    .unique(),
  draft: jsonb().$type<ResearchContent>().notNull(),
  published: jsonb().$type<ResearchContent>(),
  version: integer().notNull().default(0),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
export const revisionTable = pgTable(
  "revisions",
  {
    id: text().primaryKey(),
    researchId: text("research_id")
      .references(() => researchTable.id, { onDelete: "cascade" })
      .notNull(),
    version: integer().notNull(),
    action: text().notNull(),
    content: jsonb().$type<ResearchContent>().notNull(),
    createdAt: timestamp("created_at", { withTimezone: true })
      .defaultNow()
      .notNull(),
  },
  (t) => [uniqueIndex("revision_version_idx").on(t.researchId, t.version)],
);
export const importTable = pgTable("import_batches", {
  id: text().primaryKey(),
  digest: text().notNull().unique(),
  source: text().notNull(),
  status: text().notNull().default("staged"),
  rows: jsonb().notNull(),
  summary: jsonb().notNull(),
  createdAt: timestamp("created_at", { withTimezone: true })
    .defaultNow()
    .notNull(),
});
