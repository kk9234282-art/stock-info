import type { Metadata } from "next";
import Link from "next/link";
import { BookOpen, ArrowUpRight } from "lucide-react";
import Theme from "@/components/Theme";
import "./globals.css";
export const metadata: Metadata = {
  title: {
    default: "Business Atlas — Understand every Indian business",
    template: "%s | Business Atlas",
  },
  description:
    "An educational encyclopedia of Indian listed businesses. Explore business models, operations and sourced research.",
};
export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body>
        <a className="skip" href="#main">
          Skip to content
        </a>
        <header className="header">
          <div className="container nav">
            <Link href="/" className="brand">
              <span className="brand-icon">
                <BookOpen size={21} />
              </span>
              business<span className="brand-light">atlas</span>
              <span className="edition">INDIA</span>
            </Link>
            <nav aria-label="Main navigation">
              <Link href="/companies">Companies</Link>
              <Link href="/#learn">
                How to explore <ArrowUpRight size={13} />
              </Link>
              <Theme />
            </nav>
          </div>
        </header>
        <main id="main">{children}</main>
        <footer>
          <div className="container footer-inner">
            <Link href="/" className="brand">
              <BookOpen size={20} /> business
              <span className="brand-light">atlas</span>
            </Link>
            <p>
              Business understanding. Informed curiosity.
              <br />
              <small>Educational research only · No investment advice</small>
            </p>
            <Link href="/admin">
              Editorial workspace <ArrowUpRight size={14} />
            </Link>
          </div>
        </footer>
      </body>
    </html>
  );
}
