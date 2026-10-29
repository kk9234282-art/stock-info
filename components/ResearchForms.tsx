"use client";
import { useState } from "react";
import {
  metricDefinitions,
  researchSchema,
  type ResearchContent,
} from "@/lib/content";

/** Structured entry keeps common editorial tasks out of the advanced JSON editor. */
export default function ResearchForms({
  content,
  update,
}: {
  content: ResearchContent;
  update: (value: ResearchContent) => void;
}) {
  const [error, setError] = useState("");
  function accept(next: ResearchContent, form: HTMLFormElement) {
    const result = researchSchema.safeParse(next);
    if (!result.success) {
      setError(result.error.issues.map((x) => x.message).join("; "));
      return;
    }
    update(result.data);
    form.reset();
    setError("");
  }
  const field = (data: FormData, key: string) =>
    String(data.get(key) ?? "").trim();
  return (
    <div className="research-forms">
      {error && <p role="alert">{error}</p>}
      <details>
        <summary>Add a research section</summary>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const d = new FormData(form);
            accept(
              {
                ...content,
                sections: [
                  ...content.sections,
                  {
                    id: field(d, "id"),
                    title: field(d, "title"),
                    body: field(d, "body"),
                    kind: "unverified",
                    sourceIds: [],
                  },
                ],
              },
              form,
            );
          }}
        >
          <label>
            Section identifier
            <input
              name="id"
              required
              pattern="[a-z0-9-]+"
              placeholder="industry-context"
            />
          </label>
          <label>
            Section title
            <input name="title" required />
          </label>
          <label>
            Research text
            <textarea name="body" required rows={4} />
          </label>
          <button>Add unverified section</button>
        </form>
      </details>
      <details>
        <summary>Add a verified source reference</summary>
        <p>
          Record only documents you have actually checked. This form cannot
          verify a document for you.
        </p>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const d = new FormData(form);
            accept(
              {
                ...content,
                sources: [
                  ...content.sources,
                  {
                    id: field(d, "id"),
                    title: field(d, "title"),
                    publisher: field(d, "publisher"),
                    url: field(d, "url"),
                    period: field(d, "period"),
                    publishedAt: field(d, "publishedAt"),
                    verifiedAt: field(d, "verifiedAt"),
                  },
                ],
              },
              form,
            );
          }}
        >
          <div className="form-grid">
            <label>
              Source identifier
              <input name="id" required />
            </label>
            <label>
              Document title
              <input name="title" required />
            </label>
            <label>
              Publisher
              <input name="publisher" required />
            </label>
            <label>
              Reporting period
              <input
                name="period"
                required
                placeholder="Year ended 31 March YYYY"
              />
            </label>
            <label>
              Official source URL
              <input name="url" type="url" required placeholder="https://…" />
            </label>
            <label>
              Publication date, if known
              <input name="publishedAt" type="date" />
            </label>
            <label>
              Date you verified the source
              <input name="verifiedAt" type="date" required />
            </label>
          </div>
          <button>Add source to draft</button>
        </form>
      </details>
      <details>
        <summary>Add a financial or operating observation</summary>
        {!content.sources.length ? (
          <p>Add a verified source before entering any numeric observations.</p>
        ) : (
          <form
            onSubmit={(event) => {
              event.preventDefault();
              const form = event.currentTarget;
              const d = new FormData(form);
              const key = field(d, "key");
              const definition = metricDefinitions.find((m) => m[0] === key)!;
              accept(
                {
                  ...content,
                  metrics: [
                    ...content.metrics,
                    {
                      key,
                      label: definition[1],
                      year: field(d, "year"),
                      value: Number(d.get("value")),
                      unit: definition[3] as ResearchContent["metrics"][number]["unit"],
                      basis: field(d, "basis") as "consolidated" | "standalone",
                      sourceId: field(d, "sourceId"),
                      definition: field(d, "definition"),
                    },
                  ],
                },
                form,
              );
            }}
          >
            <div className="form-grid">
              <label>
                Metric
                <select name="key">
                  {metricDefinitions.map((m) => (
                    <option key={m[0]} value={m[0]}>
                      {m[1]} ({m[3]})
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Financial year
                <input
                  name="year"
                  required
                  pattern="FY[0-9]{4}"
                  placeholder="FY2025"
                />
              </label>
              <label>
                Reported value
                <input name="value" type="number" required step="any" />
              </label>
              <label>
                Reporting basis
                <select name="basis">
                  <option value="consolidated">Consolidated</option>
                  <option value="standalone">Standalone</option>
                </select>
              </label>
              <label>
                Verified source
                <select name="sourceId">
                  {content.sources.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Exact definition and scope
                <textarea name="definition" required rows={3} />
              </label>
            </div>
            <button>Add observation to draft</button>
          </form>
        )}
      </details>
      <details>
        <summary>Reference a permitted image</summary>
        <form
          onSubmit={(event) => {
            event.preventDefault();
            const form = event.currentTarget;
            const d = new FormData(form);
            accept(
              {
                ...content,
                imageUrl: field(d, "url"),
                imageLicense: field(d, "permission"),
              },
              form,
            );
          }}
        >
          <label>
            Image URL
            <input name="url" type="url" required />
          </label>
          <label>
            Permission, licence and attribution
            <textarea name="permission" required rows={3} />
          </label>
          <button>Add image reference</button>
        </form>
      </details>
    </div>
  );
}
