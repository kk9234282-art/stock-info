# Database schema

PostgreSQL is the source of truth. Definitions: `lib/schema.ts`; initial migration: `db/migrations/001_initial.sql`. Migration execution is transactional, uses an advisory lock and records completion in `schema_migrations`.

| Table             | Purpose                                                                      | Important constraints                                         |
| ----------------- | ---------------------------------------------------------------------------- | ------------------------------------------------------------- |
| companies         | Stable internal UUID, optional verified ISIN, slug, name and classifications | Unique slug and ISIN; name index                              |
| listings          | Many NSE/BSE listings for one company                                        | Unique exchange + symbol; company foreign key; exchange check |
| research          | Editable and independently published JSON documents                          | One record per company; optimistic version; update timestamp  |
| revisions         | Immutable application-level audit snapshots for saves and publication        | Unique research + version; action and creation timestamp      |
| import_batches    | Staged validated metadata, failures and retry identity                       | Unique source/content digest; status and timestamp            |
| schema_migrations | Applied SQL migration ledger                                                 | Unique migration name                                         |

Foreign keys cascade only when a company/research record is explicitly deleted. The application provides no deletion endpoint. Revisions have no edit/delete API; database administrators still have direct database access.

## Research JSON

The same Zod schema validates writes, seeded content, published reads and the database readiness check. An example **shape**, not actual company data:

```ts
{
 description: string,
 headquarters: string, // explicitly pending until verified
 website: string, // HTTPS or empty
 imageUrl: string, // HTTPS or empty; reference-only
 imageLicense: string, // required if imageUrl is populated
 reviewNote: string,
 sections: [{
   id: string, title: string, body: string,
   kind: 'verified' | 'interpretation' | 'unverified' | 'educational',
   sourceIds: string[]
 }],
 sources: [{
   id: string, title: string, publisher: string, url: string,
   period: string, publishedAt: string, verifiedAt: 'YYYY-MM-DD'
 }],
 metrics: [{
   key: string, label: string, year: 'FY2025', value: number,
   unit: '₹ crore' | '%' | 'MMT' | 'x' | 'TEU' | '₹/tonne',
   basis: 'consolidated' | 'standalone', sourceId: string,
   definition: string
 }]
}
```

FY2025 denotes the Indian financial year ending March 2025 when the source uses that convention. The editor must confirm and record the actual reporting scope in the source period and observation definition. No FY observations are initially populated. Do not mix attributable profit, total group profit, adjusted EBITDA, gross debt or net debt without explicit definitions. Revenue per tonne uses ₹/tonne, not ₹ crore. Free cash flow is not entered unless its definition can remain consistent.

Sections and sources must have unique IDs. Verified sections need citations. Metric source IDs must exist. Dates and URL shapes are validated; actual financial accuracy, period comparability, source ownership and human verification require editorial review. Source IDs should remain stable across revisions. Unavailable observations are absent, never zero.

## Import input

Staging rows contain `name`, `isin`, `exchange` (`NSE` or `BSE`), `symbol`, and optional verified `sector`/`industry`. Current staging performs format validation, Unicode/whitespace normalization, listing deduplication and conflicting-identity rejection. Production promotion must additionally verify ISIN check digits, exchange licensing, listing classes, issuer/corporate-action history and ISIN changes against authoritative masters. Never assume all securities are ordinary listed operating companies. No import is executed as part of this prototype.
