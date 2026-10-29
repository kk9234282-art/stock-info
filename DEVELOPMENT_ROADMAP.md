# Development roadmap

## Phase A–D: delivered prototype software

- One-company PostgreSQL database, migrations and non-destructive seed.
- Responsive editorial homepage, live company search, paginated directory and breadcrumbs.
- Ten-section research template, interactive cargo journey, definitions, financial chart infrastructure and source states.
- Light/dark theme and keyboard-accessible navigation/controls.
- Server-authenticated editorial workspace, draft preview, explicit publication, revisions and concurrency protection.
- Bounded, validated, auditable import staging; no exchange fetch or promotion.
- TypeScript, lint, production build, database and real-browser checks. See VALIDATION.md for actual outcomes.

## Phase C outstanding: verified APSEZ research

Software completion does not complete company research. Obtain permitted official annual reports and filings; verify legal identity, headquarters, business footprint and statutory segment structure. Enter audited annual consolidated financial observations, operating history, source references and reporting definitions. Reconcile revenue and EBITDA between disclosures. Separate analytical conclusions from facts and attach citations to every important factual claim. Review risks and projects against the latest reporting period. Supply a permitted company image only with clear rights. Do not infer an APSEZ revenue mix from generic port-industry categories.

The cloud network draft requests company-site access. Saving it does not apply it. Review/save relevant network settings and publish the environment if the product requires it, then retry the official request. Any redirected report/CDN or exchange destination must be established from actual official links before extending the allowlist.

## Phase E: user review gate

Present the working prototype, screenshots, tests and missing research. **Stop and wait for explicit prototype approval before expanding company coverage.** Do not publicly deploy without separate user approval. The prototype is not represented as completed, investment-ready research.

## After approval: controlled metadata import

1. Verify current NSE/BSE masters, eligible security classes, source terms and redistribution rights. Store a permission/source manifest.
2. Add source adapters producing normalized staging rows; implement ISIN check-digit checks and explicit corporate-action handling.
3. Review duplicate rules using verified ISIN and exchange listing identity, with an exception queue for ambiguity. Never merge purely by similar names.
4. Stage batches of at most 500 rows; retain content digests, source provenance, validation failures and checkpoints. Restart by batch digest, not by repeating untracked writes.
5. Implement an explicitly gated promotion transaction that upserts company/listing identity and creates blank unpublished drafts for new issuers. Preserve existing approved/published research and record changed fields, prior values and batch ownership.
6. Test a licensed small batch in a separate database. Verify rerun idempotency, a simulated interruption, manual exceptions and identity conflicts.
7. Back up the database; provide rollback from the promotion manifest, refusing to overwrite subsequent editorial changes. Review an import summary before the approved full run.
8. Add researched articles only after sufficient permitted evidence exists. Company metadata coverage is not research coverage.

## Before public production

Use managed PostgreSQL with verified TLS, backups and a restricted application database role. Add a maintained multi-user authentication provider, MFA/roles and durable rate limiting. Test canonical-origin checks behind the actual deployment proxy, security headers, session expiry and revision access. Configure the real SITE_URL and secrets in the hosting platform, not source files. Validate accessibility, load/SEO behaviour and source licensing on completed research. Add monitoring and measured caching/search indexes. Do not assume local checks constitute deployment validation.

## Deferred

Comparisons, screening, watchlists, automated updates, mobile applications and any AI features are outside this prototype.
