import { authorized, configured } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyTable, researchTable, revisionTable } from "@/lib/schema";
import { eq, desc, asc } from "drizzle-orm";
import Editor from "@/components/Editor";
export const dynamic = "force-dynamic";
export const metadata = {
  title: "Editorial workspace",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  if (!(await authorized()))
    return (
      <div className="container section login">
        <p className="eyebrow">EDITORIAL WORKSPACE</p>
        <h1>
          Good research
          <br />
          starts with care.
        </h1>
        <p>Sign in to manage drafts, sources and published research.</p>
        {!configured() ? (
          <div className="notice">
            Administration is disabled until ADMIN_PASSWORD and a SESSION_SECRET
            of at least 32 characters are securely configured.
          </div>
        ) : (
          <form method="post" action="/api/session">
            <label>
              Administrator password
              <input
                name="password"
                type="password"
                required
                autoComplete="current-password"
              />
            </label>
            <button className="primary-button">Sign in →</button>
          </form>
        )}
      </div>
    );
  const records = await db
    .select({ company: companyTable, research: researchTable })
    .from(companyTable)
    .leftJoin(researchTable, eq(companyTable.id, researchTable.companyId))
    .orderBy(asc(companyTable.name));
  const rows = await Promise.all(
    records.map(async (r) => ({
      ...r.company,
      research: r.research
        ? {
            ...r.research,
            revisions: await db
              .select()
              .from(revisionTable)
              .where(eq(revisionTable.researchId, r.research.id))
              .orderBy(desc(revisionTable.version))
              .limit(20),
          }
        : null,
    })),
  );
  return (
    <div className="container section">
      <p className="eyebrow">EDITORIAL WORKSPACE</p>
      <h1>Research, carefully managed.</h1>
      <p className="muted">
        Save a draft, preview it, then publish explicitly. Public pages show
        only published versions.
      </p>
      <Editor
        companies={rows.map((c) => ({
          slug: c.slug,
          name: c.name,
          version: c.research?.version ?? 0,
          draft: c.research?.draft ?? null,
          revisions:
            c.research?.revisions.map((v) => ({
              id: v.id,
              version: v.version,
              action: v.action,
              createdAt: v.createdAt.toISOString(),
              content: v.content,
            })) ?? [],
        }))}
      />
    </div>
  );
}
