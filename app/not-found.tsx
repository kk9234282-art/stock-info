import Link from "next/link";
export default function NotFound() {
  return (
    <div className="container section empty">
      <h1>Page not found</h1>
      <p>This company may not have published research yet.</p>
      <Link href="/companies">Explore the directory →</Link>
    </div>
  );
}
