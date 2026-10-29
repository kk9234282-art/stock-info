import { createHash } from "node:crypto";
import { z } from "zod";
export const importRow = z.object({
  name: z.string().trim().min(2),
  isin: z.string().regex(/^[A-Z]{2}[A-Z0-9]{9}[0-9]$/),
  exchange: z.enum(["NSE", "BSE"]),
  symbol: z.string().trim().min(1),
  sector: z.string().trim().optional(),
  industry: z.string().trim().optional(),
});
export function normalizeName(s: string) {
  return s.normalize("NFKC").replace(/\s+/g, " ").trim();
}
export function stageRows(input: unknown[]) {
  const seen = new Map<string, string>();
  const accepted: z.infer<typeof importRow>[] = [];
  const rejected: { index: number; reason: string }[] = [];
  input.forEach((raw, index) => {
    const p = importRow.safeParse(raw);
    if (!p.success) {
      rejected.push({ index, reason: p.error.message });
      return;
    }
    const row = { ...p.data, name: normalizeName(p.data.name) };
    const key = row.exchange + ":" + row.symbol.toUpperCase();
    const identity = seen.get(key);
    if (identity && identity !== row.isin) {
      rejected.push({ index, reason: "Listing maps to conflicting ISINs" });
      return;
    }
    if (identity) return;
    seen.set(key, row.isin);
    accepted.push({ ...row, symbol: row.symbol.toUpperCase() });
  });
  return { accepted, rejected };
}
export function batchDigest(source: string, rows: unknown[]) {
  return createHash("sha256")
    .update(JSON.stringify({ source, rows }))
    .digest("hex");
}
