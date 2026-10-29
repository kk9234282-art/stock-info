# Architecture

## Scope and decisions

The prototype covers one company and separates software readiness from research verification. A working interface is not evidence of accurate financial research. Unknowns are visible, and unverified company pages are excluded from search indexing and the XML sitemap.

Next.js App Router and TypeScript provide server-rendered pages, metadata and same-origin APIs compatible with Vercel. React client components handle search suggestions, accessible tabbed cargo stages, themes, financial chart selection and editing. Tailwind 4 supplies the CSS processing pipeline; semantic CSS tokens implement a restrained green editorial design and responsive layouts without external font/image dependencies. Recharts renders only existing sourced observations.

PostgreSQL stores company identity, listings, versioned research and import staging. Drizzle and `pg` provide typed SQL without a separate engine download. Prisma was initially attempted, but its engine/checksum endpoint was denied by network policy; no verification was bypassed. Real PostgreSQL is provided locally by `embedded-postgres`, obtained through the package registry with npm integrity checks. Production uses managed PostgreSQL via `DATABASE_URL`, not an embedded process in Vercel.

The database schema and SQL migrations are in `lib/schema.ts` and `db/migrations/`. `lib/repository.ts` centralizes public reads. No page generates research dynamically or calls an AI service. Publishing content is an explicit editor action; all research shown on public pages is read from stored `published` JSON.

## Content model

Small relational identity tables coexist with validated JSONB research documents. A complete document contains sections, source metadata, metric observations and editorial status. This keeps citations and revisions atomic and avoids unnecessary tables for a one-company prototype. It can accommodate varied industry sections and metric definitions. At higher data volumes, extract observations and sources into relational tables while retaining versioned document snapshots and stable source IDs.

A section is marked verified, unverified, educational or analytical interpretation. Generic industry explanations never silently become verified APSEZ facts. The initial published document is a clearly labelled prototype scaffold, with no official source or financial observations. Publication validation checks referenced source IDs but cannot confirm that a human actually read a document; editorial review remains required.

## Request flow

1. Public pages query a company joined to non-null published research.
2. Public search matches name, listing identifier, sector or industry using parameterized SQL, with a 20-company limit and pagination.
3. Admin login validates a server-only password; signed, expiring HttpOnly SameSite cookies establish the administrator role. Production cookies are Secure.
4. Every write checks the role and same origin. Canonical `SITE_URL` is enforced when configured to a hosted domain.
5. A transactional update checks the previous version, updates the draft (and published version only on explicit publication), and appends a revision.
6. Restore loads a prior revision into the editor; saving and publishing remain separate actions.

The single-admin credential is generated locally or supplied through secure runtime configuration. No secret is returned by an application API. Login attempts are limited in memory for this private prototype; this is not a durable distributed control for serverless production. Rotate `SESSION_SECRET` to revoke all sessions. Never expose the prototype publicly before the requested review and deployment hardening.

## Scaling and SEO

Pages use SSR for immediately consistent publication. Directory queries are bounded; listing identities and company slugs are indexed and unique. A future production workload can add measured cache invalidation on publication, trigram search, normalized metric tables and batched sitemap indexes above 50,000 URLs. Current sitemap generation does not cap company coverage at the directory page size and excludes source-empty profiles. Do not cache admin pages or private drafts.

API errors, empty data and missing pages have visible states. React escapes stored text. Source/image links require HTTPS. Remote images are referenced rather than proxied or uploaded, avoiding arbitrary server-side URL fetches and unapproved image licensing.

## Future imports

Staging is separate from editorial publication. Batch hashes make retries idempotent and rows are validated before storage. Exact ISIN matching is the intended cross-exchange key, with listing identities unique per exchange. Do not match by company-name similarity alone. Live source adapters and promotion are deliberately not enabled before licensing review and prototype approval. A future promotion transaction must preserve published research, create blank drafts only for new companies, log row-level decisions and provide a batch manifest for rollback. The current stage-only command does not claim to implement promotion or research production.

## Reference-led reading view

The company article now follows the supplied visual references: a black default theme, one centred reading column, a three-panel image collage, photo-led business explanations, vertical interactive journey cards, four financial summary cards, and numbered narrative sections. The light theme remains available. Company facts and published research stay in PostgreSQL; this is a presentation change, not a source-verification or financial-data import. Financial summary cards use the latest available consolidated reporting year and display an explicit unverified state when observations are absent. The imagery is a labelled fictional editorial illustration; see `public/images/ASSET_NOTES.md`.
