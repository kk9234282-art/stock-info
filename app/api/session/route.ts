import { NextResponse } from "next/server";
import { configured, passwordValid, token, sameOrigin } from "@/lib/auth";
const attempts = new Map<string, { count: number; until: number }>();
export async function POST(req: Request) {
  if (!sameOrigin(req))
    return NextResponse.json({ error: "Origin rejected" }, { status: 403 });
  if (!configured())
    return NextResponse.json(
      {
        error:
          "Admin is disabled. Configure ADMIN_PASSWORD and SESSION_SECRET securely.",
      },
      { status: 503 },
    );
  const key = "global";
  let state = attempts.get(key);
  if (!state || state.until < Date.now()) {
    state = { count: 0, until: Date.now() + 60000 };
    attempts.set(key, state);
  }
  if (++state.count > 10)
    return NextResponse.json(
      { error: "Too many attempts. Try again in a minute." },
      { status: 429 },
    );
  const form = await req.formData();
  if (!passwordValid(String(form.get("password") ?? "")))
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  const res = NextResponse.redirect(
    new URL("/admin", req.headers.get("origin")!),
    303,
  );
  res.cookies.set("atlas_session", token(), {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 8 * 3600,
  });
  return res;
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return new Response(null, { status: 403 });
  const res = NextResponse.json({ ok: true });
  res.cookies.delete("atlas_session");
  return res;
}
