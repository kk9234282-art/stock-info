import Link from "next/link";
import { ArrowUpRight, Anchor } from "lucide-react";
import Search from "@/components/Search";
import { companies } from "@/lib/repository";
export const dynamic = "force-dynamic";
export const metadata = { title: "Company directory" };
export default async function Directory({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; browse?: string }>;
}) {
  const p = await searchParams;
  const q = (p.q ?? "").slice(0, 100);
  const page = Math.min(100000, Math.max(1, Math.floor(Number(p.page) || 1)));
  const rows = await companies(q, page);
  return (
    <div className="container directory section">
      <div className="breadcrumb">
        <Link href="/">Home</Link> / Companies
      </div>
      <p className="eyebrow">THE COMPANY COLLECTION</p>
      <h1>
        Discover the business
        <br />
        behind the name.
      </h1>
      <p className="muted">
        One company in the prototype. No artificial listings, no filler.
      </p>
      <Search />
      {p.browse && (
        <div className="notice">
          Browsing by {p.browse}. Classification, index membership and market
          capitalisation await verification; no unverified filters are applied.
        </div>
      )}
      {q && <p>Results for “{q}”</p>}
      <div className="directory-table">
        <div className="table-heading">
          <span>COMPANY</span>
          <span>LISTINGS</span>
          <span>RESEARCH STATUS</span>
        </div>
        {rows.map((c) => (
          <Link
            href={"/companies/" + c.slug}
            className="directory-row"
            key={c.id}
          >
            <div>
              <span className="mini-mark">
                <Anchor size={22} />
              </span>
              <strong>{c.name}</strong>
            </div>
            <span>
              {c.listings.map((l) => l.exchange + ": " + l.symbol).join(" · ")}
            </span>
            <span className="status">
              Verification pending <ArrowUpRight size={16} />
            </span>
          </Link>
        ))}
      </div>
      {!rows.length && (
        <div className="empty">
          <h2>No matching companies</h2>
          <p>Try Adani Ports, ADANIPORTS or 532921.</p>
          <Link href="/companies">Clear search →</Link>
        </div>
      )}
      <div className="pagination">
        {page > 1 && (
          <Link
            href={
              "/companies?page=" + (page - 1) + "&q=" + encodeURIComponent(q)
            }
          >
            ← Previous
          </Link>
        )}
        <span>Page {page}</span>
        {rows.length === 20 && (
          <Link
            href={
              "/companies?page=" + (page + 1) + "&q=" + encodeURIComponent(q)
            }
          >
            Next →
          </Link>
        )}
      </div>
    </div>
  );
}
