# Deploying the prototype on Vercel

The application code is on `prototype/adani-ports` and is being fast-forwarded to `main` for the existing Vercel deployment. The original `main` contained only a README, which could not serve the prototype. An old deployment remains unchanged until Vercel builds the updated application commit.

## 1. Select the application branch

In the Vercel project, check the Git branch and commit associated with the deployment. Use the updated `main` branch for production, or select `prototype/adani-ports` explicitly for a preview. Confirm the selected commit contains `package.json` and the `app/` directory.

Use the Next.js framework preset, repository root (`./`) as the root directory, Node.js 24, and the default Next.js output directory. Do not use a static-export preset or manually set an `out` output directory; this application uses server rendering and API routes.

## 2. Connect hosted PostgreSQL

The `.local/postgres` database runs only in the development workspace. It is ignored by Git and does not run inside Vercel functions. Connect a hosted PostgreSQL provider and supply its connection string as `DATABASE_URL` in the Vercel environment used by the deployment. Do not use the loopback development URL from `.env.example` on Vercel. Keep the provider’s TLS verification enabled. Use the provider’s documented pooler configuration for serverless connections.

The database requires migrations and the one-company seed. With `DATABASE_URL` configured, a suitable build command for this prototype is:

```sh
npm run db:migrate && npm run db:seed && npm run build
```

Migrations are transactional and recorded once; the seed preserves existing research. These commands were exercised against the local PostgreSQL instance. Hosted database connectivity and provider permissions must still be tested on the actual deployment. Keep development dependencies installed during the build, since the migration command uses `tsx`.

## 3. Runtime environment variables

| Variable         | Purpose                                                           |
| ---------------- | ----------------------------------------------------------------- |
| `DATABASE_URL`   | Hosted PostgreSQL connection string; mandatory for public pages   |
| `SITE_URL`       | Canonical HTTPS deployment origin, without a trailing path        |
| `ADMIN_PASSWORD` | Private administrator password; do not share in chat or commit it |
| `SESSION_SECRET` | Random private signing secret, at least 32 characters             |

Admin credentials are required only for editing. Administration fails closed without them; the public site still requires a functioning database. Store actual values securely in Vercel, not in source control. Scope values to the environment you are deploying and redeploy after changing them.

## 4. Diagnose the visible symptom

- **404 / NOT_FOUND:** verify the application branch, successful deployment status, root directory and framework preset before changing application code.
- **Build failure:** inspect the first actual error in the build logs. A migration connection failure usually concerns the hosted database or its environment binding; do not suppress it.
- **“We couldn’t load this page”:** inspect server runtime logs for database connectivity, TLS, missing tables or missing configuration. A successful Next.js build does not establish database readiness.
- **Empty directory:** check that `db:seed` completed in the same database used at runtime. Only the sole Adani Ports scaffold is seeded; no financial values are invented.
- **Admin login origin rejection:** set `SITE_URL` to the exact canonical origin being used. Use that origin to sign in.

After redeployment, verify the homepage, company search, `/companies/adani-ports`, and `/admin`. Confirm anonymous admin writes are rejected. Do not run the development browser tests against production data because they temporarily publish and restore a test description.

This document does not execute a Vercel deployment. Updating a branch connected to Vercel may trigger its configured deployment workflow. The uploaded screenshots are available in `docs/screenshots` even before a hosted database is configured.
