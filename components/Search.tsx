"use client";
import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { Search as SearchIcon, ArrowUpRight } from "lucide-react";
type Result = { slug: string; name: string; symbol: string };
export default function Search({ compact = false }: { compact?: boolean }) {
  const [q, setQ] = useState("");
  const [rows, setRows] = useState<Result[]>([]);
  const [open, setOpen] = useState(false);
  const [error, setError] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(() => {
      fetch("/api/search?q=" + encodeURIComponent(q), {
        signal: controller.signal,
      })
        .then((r) => {
          if (!r.ok) throw Error();
          return r.json();
        })
        .then((r) => {
          setRows(r);
          setError(false);
        })
        .catch((e) => {
          if (e.name !== "AbortError") setError(true);
        });
    }, 180);
    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [q]);
  return (
    <div className={"search-wrap " + (compact ? "compact" : "")} ref={ref}>
      <form action="/companies" role="search">
        <SearchIcon size={20} />
        <input
          aria-label="Search companies"
          name="q"
          placeholder={
            compact
              ? "Find a company…"
              : "Search company name, NSE symbol or BSE code"
          }
          value={q}
          onChange={(e) => {
            setQ(e.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 180)}
        />
        <button aria-label="Submit company search">
          <span>Search</span>
          <ArrowUpRight size={17} />
        </button>
      </form>
      {open && q && (
        <div className="suggestions">
          {error ? (
            <p>Search unavailable. Please try again.</p>
          ) : rows.length ? (
            rows.map((r) => (
              <Link key={r.slug} href={"/companies/" + r.slug}>
                <strong>{r.symbol}</strong>
                <span>{r.name}</span>
                <ArrowUpRight size={16} />
              </Link>
            ))
          ) : (
            <p>
              No matching companies. This prototype covers Adani Ports only.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
