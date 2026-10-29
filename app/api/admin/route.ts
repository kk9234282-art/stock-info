import { randomUUID } from "node:crypto";
import { and, eq } from "drizzle-orm";
import { authorized, sameOrigin } from "@/lib/auth";
import { db } from "@/lib/db";
import { companyTable, researchTable, revisionTable } from "@/lib/schema";
import { researchSchema } from "@/lib/content";
import { z } from "zod";
const payload = z.object({
  action: z.enum(["save", "publish", "restore", "create"]),
  slug: z
    .string()
    .regex(/^[a-z0-9-]+$/)
    .max(100),
  expectedVersion: z.number().int().nonnegative(),
  content: researchSchema,
  name: z.string().min(1).optional(),
  revisionId: z.string().optional(),
});
export async function POST(req: Request) {
  if (!(await authorized()))
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  if (!sameOrigin(req))
    return Response.json({ error: "Origin rejected" }, { status: 403 });
  const raw = await req.text();
  if (raw.length > 1000000)
    return Response.json({ error: "Request too large" }, { status: 413 });
  let json;
  try {
    json = JSON.parse(raw);
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = payload.safeParse(json);
  if (!parsed.success)
    return Response.json(
      { error: parsed.error.issues.map((x) => x.message).join("; ") },
      { status: 400 },
    );
  const p = parsed.data;
  try {
    const result = await db.transaction(async (tx) => {
      if (p.action === "create") {
        if (!p.name) throw Error("Name required");
        const id = randomUUID(),
          rid = randomUUID();
        await tx
          .insert(companyTable)
          .values({ id, slug: p.slug, name: p.name });
        await tx
          .insert(researchTable)
          .values({ id: rid, companyId: id, draft: p.content, version: 1 });
        await tx
          .insert(revisionTable)
          .values({
            id: randomUUID(),
            researchId: rid,
            version: 1,
            action: "created draft",
            content: p.content,
          });
        return { slug: p.slug, version: 1 };
      }
      const [c] = await tx
        .select()
        .from(companyTable)
        .where(eq(companyTable.slug, p.slug));
      if (!c) throw Error("Company missing");
      const [r] = await tx
        .select()
        .from(researchTable)
        .where(eq(researchTable.companyId, c.id));
      if (!r) throw Error("Research missing");
      let content = p.content;
      if (p.action === "restore") {
        const [old] = await tx
          .select()
          .from(revisionTable)
          .where(
            and(
              eq(revisionTable.id, p.revisionId ?? ""),
              eq(revisionTable.researchId, r.id),
            ),
          );
        if (!old) throw Error("Revision missing");
        content = researchSchema.parse(old.content);
      }
      const updated = await tx
        .update(researchTable)
        .set({
          draft: content,
          ...(p.action === "publish" ? { published: content } : {}),
          version: r.version + 1,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(researchTable.id, r.id),
            eq(researchTable.version, p.expectedVersion),
          ),
        )
        .returning({ id: researchTable.id });
      if (updated.length !== 1) throw Error("Conflict: reload before saving");
      await tx
        .insert(revisionTable)
        .values({
          id: randomUUID(),
          researchId: r.id,
          version: r.version + 1,
          action: p.action,
          content,
        });
      return { version: r.version + 1 };
    });
    return Response.json(result);
  } catch (e) {
    return Response.json(
      { error: e instanceof Error ? e.message : "Save failed" },
      { status: 409 },
    );
  }
}
