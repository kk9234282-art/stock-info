import Link from "next/link";
import {
  ArrowUpRight,
  ArrowRight,
  Anchor,
  Layers3,
  ChartNoAxesCombined,
  BookOpen,
  ShieldCheck,
  Compass,
} from "lucide-react";
import Search from "@/components/Search";
import { companies } from "@/lib/repository";
export const dynamic = "force-dynamic";
export default async function Home() {
  const rows = await companies();
  const c = rows.find((c) => c.slug === "adani-ports");
  return (
    <>
      <section className="hero container">
        <div className="hero-copy">
          <p className="eyebrow">
            <span className="green-dot" /> THE INDIAN BUSINESS ENCYCLOPEDIA
          </p>
          <h1>
            Understand every
            <br />
            Indian <em>business.</em>
          </h1>
          <p className="hero-description">
            Explore how India’s publicly listed companies operate,
            <br className="desktop" /> generate revenue, grow, and compete.
          </p>
          <Search />
          <div className="search-hint">
            Start exploring{" "}
            <Link href="/companies/adani-ports">
              ADANIPORTS <ArrowUpRight size={12} />
            </Link>
            <span>One company. A deeper understanding.</span>
          </div>
        </div>
        <div
          className="hero-art"
          aria-label="Illustration of a port and its logistics connections"
        >
          <div className="art-grid" />
          <div className="art-label">A BUSINESS, CONNECTED.</div>
          <div className="port-graphic">
            <div className="crane crane-one" />
            <div className="crane crane-two" />
            <div className="cargo cargo-one" />
            <div className="cargo cargo-two" />
            <div className="cargo cargo-three" />
            <div className="vessel" />
            <div className="waves" />
          </div>
          <div className="art-card art-top">
            <span className="small-icon">
              <Anchor size={16} />
            </span>
            <div>
              Ports & logistics<small>Follow the value chain</small>
            </div>
          </div>
          <div className="art-card art-bottom">
            <span className="green-dot" />
            <span>From operations to understanding</span>
          </div>
          <span className="art-coordinate">
            21.00° N / 72.00° E · ILLUSTRATION
          </span>
        </div>
      </section>
      <div className="principles">
        <div className="container principles-inner">
          <span>
            <BookOpen size={16} /> Business first
          </span>
          <span>
            <Layers3 size={16} /> Built for depth
          </span>
          <span>
            <ShieldCheck size={16} /> Transparent sources
          </span>
          <span>
            <Compass size={16} /> Made for curious minds
          </span>
        </div>
      </div>
      <section className="container section">
        <div className="section-heading">
          <div>
            <p className="eyebrow">THE COMPANY COLLECTION</p>
            <h2>Great businesses, unpacked.</h2>
          </div>
          <Link className="text-link" href="/companies">
            Explore directory <ArrowRight size={16} />
          </Link>
        </div>
        <div className="browse-row">
          <span>Browse by</span>
          {["Sector", "Industry", "Market index", "Market capitalisation"].map(
            (x) => (
              <Link key={x} href={"/companies?browse=" + encodeURIComponent(x)}>
                {x}{" "}
                <span>
                  <ArrowUpRight size={16} />
                </span>
              </Link>
            ),
          )}
        </div>
        <div className="feature-grid">
          {c && (
            <Link href="/companies/adani-ports" className="featured-card">
              <div className="feature-top">
                <span className="tag">FEATURED COMPANY</span>
                <ArrowUpRight size={22} />
              </div>
              <div className="company-mark">
                AP
                <span>
                  <ArrowUpRight size={16} />
                </span>
              </div>
              <div className="listing">
                NSE: ADANIPORTS <span>·</span> BSE: 532921
              </div>
              <h3>
                Adani Ports &<br />
                Special Economic Zone
              </h3>
              <p>
                Start with the business behind the ticker.
                <br />
                Explore the port business, one layer at a time.
              </p>
              <div className="feature-bottom">
                <span className="status">
                  <span className="amber-dot" /> Research verification pending
                </span>
                <span>
                  Explore company <ArrowRight size={16} />
                </span>
              </div>
            </Link>
          )}
          <aside className="collection-note">
            <span className="note-icon">
              <Layers3 size={23} />
            </span>
            <p className="eyebrow">DEPTH BEFORE BREADTH</p>
            <h3>
              One company.
              <br />
              The complete framework.
            </h3>
            <p>
              We’re starting with Adani Ports to build a thoughtful way to
              understand a business. More companies will follow after the
              prototype is reviewed.
            </p>
            <div className="note-divider" />
            <span>
              01 <small>company in this edition</small>
            </span>
            <span>
              10 <small>research sections per company</small>
            </span>
            <Link href="/companies">
              View the collection <ArrowUpRight size={16} />
            </Link>
          </aside>
        </div>
      </section>
      <section className="learn-section" id="learn">
        <div className="container">
          <p className="eyebrow">GO BEYOND THE STOCK PRICE</p>
          <div className="learn-heading">
            <h2>
              A ticker tells you a name.
              <br />
              Understand the business behind it.
            </h2>
            <p>
              A clear path from “what does it do?” to the details that matter.
              No noise, no predictions, just understanding.
            </p>
          </div>
          <div className="learning-grid">
            {[
              [
                "01",
                "Understand the engine",
                "Explore what the company does, who it serves, and how it earns revenue.",
                <Layers3 key="1" />,
              ],
              [
                "02",
                "Follow the money",
                "Read financial metrics with their definitions, periods and sources.",
                <ChartNoAxesCombined key="2" />,
              ],
              [
                "03",
                "See the whole picture",
                "Connect operations, potential advantages, growth drivers and business risks.",
                <Compass key="3" />,
              ],
            ].map(([n, t, d, icon]) => (
              <article key={String(n)}>
                <div>
                  {icon}
                  <span>{n}</span>
                </div>
                <h3>{t}</h3>
                <p>{d}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
