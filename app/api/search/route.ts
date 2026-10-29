import { companies } from "@/lib/repository";
export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get("q") ?? "").slice(0, 100);
  const rows = await companies(q);
  return Response.json(
    rows.map((c) => ({
      slug: c.slug,
      name: c.name,
      symbol: c.listings.find((l) => l.exchange === "NSE")?.symbol,
    })),
  );
}
