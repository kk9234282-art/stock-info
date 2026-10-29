"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import ResearchForms from "./ResearchForms";
import Financials from "./Financials";
import Operations from "./Operations";
import {
  initialContent,
  researchSchema,
  type ResearchContent,
} from "@/lib/content";
type Row = {
  slug: string;
  name: string;
  version: number;
  draft: unknown;
  revisions: {
    id: string;
    version: number;
    action: string;
    createdAt: string;
    content: unknown;
  }[];
};
export default function Editor({ companies }: { companies: Row[] }) {
  const router = useRouter();
  const [row, setRow] = useState(companies[0]);
  const [text, setText] = useState(
    JSON.stringify(row?.draft ?? initialContent, null, 2),
  );
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [preview, setPreview] = useState(false);
  const [slug, setSlug] = useState("");
  const [name, setName] = useState("");
  const result = researchSchema.safeParse(
    (() => {
      try {
        return JSON.parse(text);
      } catch {
        return null;
      }
    })(),
  );
  const content = result.success ? result.data : null;
  function update(next: ResearchContent) {
    setText(JSON.stringify(next, null, 2));
  }
  async function save(
    action: "save" | "publish" | "restore" | "create",
    revisionId?: string,
  ) {
    setBusy(true);
    setMessage("");
    try {
      const c =
        action === "create"
          ? {
              ...initialContent,
              description: `Research draft for ${name}. Verification pending.`,
              reviewNote:
                "Unpublished research draft. No company information has been verified.",
              sections: initialContent.sections.map((s) => ({
                ...s,
                kind: "unverified" as const,
                body: "Research pending. No verified information has been entered.",
              })),
            }
          : researchSchema.parse(JSON.parse(text));
      const res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action,
          slug: action === "create" ? slug : row.slug,
          ...(action === "create" ? { name } : {}),
          expectedVersion: row.version,
          content: c,
          revisionId,
        }),
      });
      const body = await res.json();
      if (!res.ok) throw Error(body.error);
      if (action === "create") {
        setRow({
          slug: body.slug,
          name,
          version: body.version,
          draft: c,
          revisions: [],
        });
        setText(JSON.stringify(c, null, 2));
        setName("");
        setSlug("");
      } else setRow({ ...row, version: body.version });
      setMessage(
        action === "publish"
          ? "Published. Public research now reflects this version."
          : "Saved. Refresh to load the updated revision list.",
      );
      router.refresh();
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "Request failed");
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="editor">
      <div className="editor-toolbar">
        <label>
          Company
          <select
            value={row?.slug}
            onChange={(e) => {
              const c = companies.find((c) => c.slug === e.target.value)!;
              setRow(c);
              setText(JSON.stringify(c.draft, null, 2));
              setMessage("");
            }}
          >
            {companies.map((c) => (
              <option key={c.slug} value={c.slug}>
                {c.name}
              </option>
            ))}
          </select>
        </label>
        <button
          onClick={async () => {
            await fetch("/api/session", { method: "DELETE" });
            router.refresh();
          }}
        >
          Sign out
        </button>
      </div>
      <div className="editor-actions">
        <button disabled={busy || !content} onClick={() => save("save")}>
          Save draft
        </button>
        <button disabled={!content} onClick={() => setPreview(!preview)}>
          {preview ? "Edit content" : "Preview draft"}
        </button>
        <button
          className="primary-button"
          disabled={busy || !content}
          onClick={() => save("publish")}
        >
          Publish research
        </button>
        <a href={"/companies/" + row?.slug} target="_blank" rel="noreferrer">
          View published ↗
        </a>
      </div>
      <p role="status" className="notice">
        {message ||
          "Drafts are private. Source and metric validation is enforced on every save. Publishing is an explicit editorial decision."}
      </p>
      {!result.success && (
        <p role="alert">
          {result.error.issues.map((x) => x.message).join("; ")}
        </p>
      )}
      {preview && content ? (
        <article className="draft-preview">
          <span className="tag">PRIVATE DRAFT PREVIEW</span>
          <h2>{row.name}</h2>
          <p>{content.description}</p>
          {content.sections.map((s) => (
            <section key={s.id}>
              <h3>{s.title}</h3>
              <small>{s.kind}</small>
              <p>{s.body}</p>
              {s.id === "operations" && <Operations />}
              {s.id === "financials" && (
                <Financials
                  metrics={content.metrics}
                  sources={content.sources}
                />
              )}
            </section>
          ))}
          <h3>Sources</h3>
          {content.sources.map((s) => (
            <p key={s.id}>
              {s.title} · {s.publisher} · {s.verifiedAt}
            </p>
          ))}
        </article>
      ) : (
        <>
          {content && (
            <div className="editor-fields">
              <label>
                Business description
                <textarea
                  rows={4}
                  value={content.description}
                  onChange={(e) =>
                    update({ ...content, description: e.target.value })
                  }
                />
              </label>
              <label>
                Review / verification note
                <textarea
                  rows={3}
                  value={content.reviewNote}
                  onChange={(e) =>
                    update({ ...content, reviewNote: e.target.value })
                  }
                />
              </label>
              {content.sections.map((s, i) => (
                <details key={s.id}>
                  <summary>{s.title}</summary>
                  <label>
                    Explanation
                    <textarea
                      rows={5}
                      value={s.body}
                      onChange={(e) =>
                        update({
                          ...content,
                          sections: content.sections.map((x, j) =>
                            j === i ? { ...x, body: e.target.value } : x,
                          ),
                        })
                      }
                    />
                  </label>
                </details>
              ))}
            </div>
          )}
          {content && <ResearchForms content={content} update={update} />}
          <details>
            <summary>
              Structured research editor · sections, sources, financial
              observations & image references
            </summary>
            <p>
              Edit the validated JSON document. Every financial observation must
              reference a source ID. Image references require a permission
              statement. See DATABASE_SCHEMA.md for fields.
            </p>
            <textarea
              className="json-editor"
              aria-label="Research JSON"
              value={text}
              onChange={(e) => setText(e.target.value)}
              spellCheck={false}
            />
          </details>
        </>
      )}
      <div className="admin-bottom">
        <section>
          <h2>Revision history</h2>
          <p>
            Restore a previous version into the draft, then preview and publish
            separately.
          </p>
          {row?.revisions.map((v) => (
            <div className="revision" key={v.id}>
              <span>
                v{v.version} · {v.action}
                <small>{new Date(v.createdAt).toLocaleString()}</small>
              </span>
              <button
                disabled={busy}
                onClick={() => {
                  setText(JSON.stringify(v.content, null, 2));
                  setMessage(
                    "Loaded revision " +
                      v.version +
                      " into the editor. Save draft to retain it; publish separately.",
                  );
                }}
              >
                Load into draft
              </button>
            </div>
          ))}
        </section>
        <section>
          <h2>Create a company draft</h2>
          <p>
            Only Adani Ports is populated. Additional coverage requires
            prototype approval.
          </p>
          <label>
            Company name
            <input value={name} onChange={(e) => setName(e.target.value)} />
          </label>
          <label>
            URL slug
            <input value={slug} onChange={(e) => setSlug(e.target.value)} />
          </label>
          <button
            disabled={busy || !name || !slug}
            onClick={() => save("create")}
          >
            Create blank unpublished draft
          </button>
        </section>
      </div>
    </div>
  );
}
