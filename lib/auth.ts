import { createHmac, timingSafeEqual, randomBytes } from "node:crypto";
import { cookies } from "next/headers";
export function configured() {
  return (
    !!process.env.ADMIN_PASSWORD &&
    (process.env.SESSION_SECRET?.length ?? 0) >= 32
  );
}
export function passwordValid(input: string) {
  if (!configured()) return false;
  const a = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(input)
    .digest();
  const b = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(process.env.ADMIN_PASSWORD!)
    .digest();
  return timingSafeEqual(a, b);
}
export function token() {
  const body = `${Date.now() + 8 * 3600_000}.${randomBytes(16).toString("hex")}`;
  return (
    body +
    "." +
    createHmac("sha256", process.env.SESSION_SECRET!).update(body).digest("hex")
  );
}
export function validToken(value: string) {
  if (!configured()) return false;
  const parts = value.split(".");
  if (
    parts.length !== 3 ||
    !/^\d+$/.test(parts[0]) ||
    Number(parts[0]) < Date.now()
  )
    return false;
  const expected = createHmac("sha256", process.env.SESSION_SECRET!)
    .update(parts.slice(0, 2).join("."))
    .digest("hex");
  return (
    /^[a-f0-9]{64}$/.test(parts[2]) &&
    timingSafeEqual(Buffer.from(parts[2]), Buffer.from(expected))
  );
}
export async function authorized() {
  return validToken((await cookies()).get("atlas_session")?.value ?? "");
}
export function sameOrigin(request: Request) {
  const expected = new URL(request.url);
  const host = request.headers.get("host");
  if (host) expected.host = host;
  const site = process.env.SITE_URL ? new URL(process.env.SITE_URL) : null;
  if (site && !["localhost", "127.0.0.1"].includes(site.hostname))
    return request.headers.get("origin") === site.origin;
  return request.headers.get("origin") === expected.origin;
}
