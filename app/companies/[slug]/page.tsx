import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ArrowUpRight, Anchor, BookOpen, ArrowRight, Info } from "lucide-react";
import { company } from "@/lib/repository";
import { metricDefinitions } from "@/lib/content";
import Operations from "@/components/Operations";
import BusinessPillars from "@/components/BusinessPillars";
import PortGallery from "@/components/PortGallery";
import FinancialSummary from "@/components/FinancialSummary";
import Financials from "@/components/Financials";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const c = await company((await params).slug);
  return {
    title: c?.name ?? "Company not found",
    description: c?.content.description,
    robots: c?.content.sources.length
      ? undefined
      : { index: false, follow: true },
  };
}
const kinds = {
  verified: "Verified source",
  unverified: "Awaiting verification",
  interpretation: "Analytical framework",
  educational: "Educational explanation",
};
export default async function CompanyPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const c = await company((await params).slug);
  if (!c) return notFound();
  const r = c.content;
  const sectionOrder = [
    "business-model",
    "operations",
    "financials",
    "growth",
    "risks",
    "revenue",
    "advantages",
    "metrics",
    "overview",
    "sources",
  ];
  const sections = [...r.sections].sort((a, b) => {
    const rank = (id: string) => {
      const i = sectionOrder.indexOf(id);
      return i < 0 ? sectionOrder.length : i;
    };
    return rank(a.id) - rank(b.id);
  });
  const headings: Record<string, string> = {
    "business-model": "How Adani Ports makes money",
    operations: "How the business works in practice",
    financials: "Financial performance: how profitable is the model?",
    growth: "What drives future growth?",
    risks: "What are the main risks?",
  };
  return (
    <div className="company-reader">
      <section className="company-hero">
        <div className="container">
          <div className="breadcrumb">
            <Link href="/">Home</Link> /{" "}
            <Link href="/companies">Companies</Link> /{" "}
            {c.listings[0]?.symbol ?? c.name}
          </div>
          <div className="company-heading">
            <div className="company-mark">
              AP
              <span>
                <ArrowUpRight size={16} />
              </span>
            </div>
            <div>
              <p className="eyebrow">COMPANY RESEARCH · PROTOTYPE</p>
              <h1>
                {c.slug === "adani-ports"
                  ? "Adani Ports Business Model Explained"
                  : c.name}
              </h1>
              <div className="listing">
                {c.listings.map((l) => (
                  <span key={l.id}>
                    {l.exchange}: {l.symbol}
                  </span>
                ))}
              </div>
            </div>
            <span className="tag">
              PORTS & LOGISTICS
              <br />
              <small>Classification unverified</small>
            </span>
          </div>
          <p className="company-intro">{c.name}</p>
          <div className="company-summary">
            <span>
              <Anchor size={16} /> Infrastructure{" "}
              <small>Unverified classification</small>
            </span>
            <span>
              <BookOpen size={16} /> 10 research sections
            </span>
            <span className="status">
              <span className="amber-dot" /> Verification pending
            </span>
          </div>
        </div>
      </section>
      <div className="container research-layout">
        <article className="research">
          <div className="reader-introduction">
            <p>
              Explore the business behind the company: how a port works, where
              revenue can be earned, and which financial and operating measures
              matter.
            </p>
            <p>
              Start with the cargo journey, then connect the services, financial
              performance, growth drivers and risks.
            </p>
            <PortGallery />
          </div>
          <details className="reader-navigation">
            <summary>On this page</summary>
            <nav aria-label="Research sections">
              {sections.map((s) => (
                <a key={s.id} href={"#" + s.id}>
                  {headings[s.id] ?? s.title}
                </a>
              ))}
            </nav>
          </details>
          <div className="notice">
            <Info size={20} />
            <div>
              <strong>Research in progress</strong>
              <p>{r.reviewNote}</p>
              <small>
                Latest source verification:{" "}
                {r.sources.length
                  ? [...r.sources].sort((a, b) =>
                      b.verifiedAt.localeCompare(a.verifiedAt),
                    )[0].verifiedAt
                  : "not yet completed"}
                . Identifiers supplied by the project brief.
              </small>
            </div>
          </div>
          {sections.map((s, i) => (
            <section id={s.id} key={s.id} className="research-section">
              <div className="research-label">
                <span>
                  {s.id === "overview"
                    ? "COMPANY OVERVIEW"
                    : "BUSINESS RESEARCH"}
                </span>
                <span className={"kind " + s.kind}>{kinds[s.kind]}</span>
              </div>
              <h2>
                {`${i + 1}. `}
                {headings[s.id] ?? s.title}
              </h2>
              <p className="section-body">{s.body}</p>
              {s.sourceIds.length > 0 && (
                <div className="citations">
                  {s.sourceIds.map((id) => {
                    const source = r.sources.find((x) => x.id === id);
                    return (
                      source && (
                        <a
                          key={id}
                          href={source.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          [{source.id}] {source.title} ↗
                        </a>
                      )
                    );
                  })}
                </div>
              )}
              {s.id === "overview" && (
                <>
                  <dl className="facts">
                    <div>
                      <dt>Headquarters</dt>
                      <dd>{r.headquarters}</dd>
                    </div>
                    <div>
                      <dt>Industry</dt>
                      <dd>Ports & logistics · pending verification</dd>
                    </div>
                    <div>
                      <dt>Reporting currency</dt>
                      <dd>Indian rupee · ₹ crore</dd>
                    </div>
                    <div>
                      <dt>Official website</dt>
                      <dd>
                        {r.website ? (
                          <a
                            href={r.website}
                            rel="noopener noreferrer"
                            target="_blank"
                          >
                            Visit website ↗
                          </a>
                        ) : (
                          "Awaiting verification"
                        )}
                      </dd>
                    </div>
                  </dl>
                  <p className="muted">{r.description}</p>
                  {r.imageUrl && (
                    <p>
                      Permitted image reference:{" "}
                      <a
                        href={r.imageUrl}
                        rel="noopener noreferrer"
                        target="_blank"
                      >
                        Open image ↗
                      </a>{" "}
                      · {r.imageLicense}
                    </p>
                  )}
                </>
              )}
              {s.id === "business-model" && <BusinessPillars />}
              {s.id === "growth" && (
                <ul className="research-bullets">
                  <li>
                    <strong>Cargo demand:</strong> Import and export activity
                    can influence volumes and the mix of cargo handled.
                  </li>
                  <li>
                    <strong>Capacity expansion:</strong> New infrastructure can
                    support additional volumes if demand and execution justify
                    it.
                  </li>
                  <li>
                    <strong>Logistics integration:</strong> Rail, road and
                    warehousing can extend the services offered for one
                    shipment.
                  </li>
                  <li>
                    <strong>Acquisitions and international operations:</strong>{" "}
                    These can expand reach while adding financing, integration
                    and geopolitical risks.
                  </li>
                </ul>
              )}
              {s.id === "risks" && (
                <ul className="research-bullets">
                  <li>
                    <strong>Capital expenditure and financing:</strong>{" "}
                    Infrastructure is expensive to build and maintain.
                  </li>
                  <li>
                    <strong>Trade and economic cycles:</strong> Lower industrial
                    activity can reduce cargo demand.
                  </li>
                  <li>
                    <strong>Regulation and concessions:</strong> Tariffs,
                    environmental requirements and concession terms can affect
                    returns.
                  </li>
                  <li>
                    <strong>Customer and cargo concentration:</strong>{" "}
                    Dependence on a small number of customers or commodities can
                    increase volatility.
                  </li>
                  <li>
                    <strong>Operational and geopolitical disruption:</strong>{" "}
                    Weather, equipment failures and changes to shipping routes
                    can interrupt services.
                  </li>
                </ul>
              )}
              {s.id === "operations" && <Operations />}
              {s.id === "revenue" && (
                <div className="empty-inline">
                  Segment revenue and historical contribution: unavailable
                  pending official disclosure review.
                </div>
              )}
              {s.id === "financials" && (
                <>
                  <FinancialSummary content={r} />
                  <details className="historical-financials">
                    <summary>Explore historical financial data</summary>
                    <Financials metrics={r.metrics} sources={r.sources} />
                  </details>
                </>
              )}{" "}
              {s.id === "metrics" && (
                <div className="metric-glossary">
                  {metricDefinitions.map(([key, label, definition]) => (
                    <details key={key}>
                      <summary>
                        {label}
                        <span>+</span>
                      </summary>
                      <p>{definition}</p>
                      {r.metrics.filter((m) => m.key === key).length ? (
                        r.metrics
                          .filter((m) => m.key === key)
                          .map((m, j) => (
                            <p key={j}>
                              {m.year} · {m.basis} ·{" "}
                              {m.value.toLocaleString("en-IN")} {m.unit} ·{" "}
                              <a
                                href={
                                  r.sources.find((s) => s.id === m.sourceId)
                                    ?.url
                                }
                              >
                                Source ↗
                              </a>
                            </p>
                          ))
                      ) : (
                        <small>
                          Historical values unavailable · source verification
                          pending.
                        </small>
                      )}
                    </details>
                  ))}
                </div>
              )}
              {s.id === "sources" && (
                <div className="sources-list">
                  {r.sources.length ? (
                    r.sources.map((source) => (
                      <div key={source.id}>
                        <a
                          href={source.url}
                          rel="noopener noreferrer"
                          target="_blank"
                        >
                          {source.title}
                          <ArrowUpRight size={15} />
                        </a>
                        <p>
                          {source.publisher} · Period: {source.period}
                        </p>
                        <small>
                          Published: {source.publishedAt || "Not stated"} ·
                          Verified: {source.verifiedAt}
                        </small>
                      </div>
                    ))
                  ) : (
                    <div className="empty-inline">
                      No verified references yet. Sources will be recorded with
                      publisher, publication date, reporting period and
                      verification date.
                    </div>
                  )}
                </div>
              )}
            </section>
          ))}
          <div className="related">
            <p className="eyebrow">KEEP EXPLORING</p>
            <h3>More companies, when the research is ready.</h3>
            <p>No related companies have been added to this prototype.</p>
            <Link className="text-link" href="/companies">
              Back to company directory <ArrowRight size={16} />
            </Link>
          </div>
        </article>
      </div>
    </div>
  );
}
