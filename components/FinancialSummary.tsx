import type { ResearchContent } from "@/lib/content";
const cards = [
  { key: "revenue", title: "Revenue" },
  { key: "ebitda", title: "EBITDA" },
  { key: "profit", title: "Net profit (PAT)" },
  { key: "ebitda-margin", title: "EBITDA margin" },
];
export default function FinancialSummary({
  content,
}: {
  content: ResearchContent;
}) {
  const year = content.metrics
    .filter(
      (m) => m.basis === "consolidated" && cards.some((c) => c.key === m.key),
    )
    .map((m) => m.year)
    .sort()
    .at(-1);
  return (
    <div className="financial-summary">
      <p className="financial-period">
        {year
          ? `Consolidated financial results · ${year}`
          : "Consolidated annual results · Reporting period awaiting verification"}
      </p>
      <div className="financial-card-grid">
        {cards.map((c) => {
          const m = content.metrics.find(
            (m) =>
              m.key === c.key && m.year === year && m.basis === "consolidated",
          );
          const source = content.sources.find((s) => s.id === m?.sourceId);
          return (
            <div
              className={
                "financial-summary-card " +
                (c.key === "revenue" ? "primary-metric" : "")
              }
              key={c.key}
            >
              <span>{c.title}</span>
              <strong>
                {m
                  ? `${m.unit === "₹ crore" ? "₹" : ""}${m.value.toLocaleString("en-IN")}${m.unit === "₹ crore" ? " Cr" : m.unit === "%" ? "%" : " " + m.unit}`
                  : "Not yet verified"}
              </strong>
              {source ? (
                <a href={source.url} target="_blank" rel="noopener noreferrer">
                  {source.title} · verified {source.verifiedAt}
                </a>
              ) : (
                <small>
                  {c.key === "ebitda-margin"
                    ? "EBITDA ÷ revenue · source required"
                    : "Awaiting audited source data"}
                </small>
              )}
            </div>
          );
        })}
      </div>
      <p>
        EBITDA excludes interest, taxes, depreciation and amortisation. Its
        margin is different from the net profit margin. Compare definitions and
        reporting scope before comparing years.
      </p>
    </div>
  );
}
