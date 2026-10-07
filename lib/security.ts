import "server-only";
import { createHash, timingSafeEqual } from "node:crypto";
import { cookies, headers } from "next/headers";

/* ------------------------------------------------------------ Rate limiting */

// Fixed-window in-memory limiter. Good for a single instance; for multiple
// instances back it with Redis/Upstash using the same function signature.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, limit: number, windowMs: number) {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    if (buckets.size > 10_000) {
      for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
    }
    return { ok: true };
  }
  b.count++;
  return { ok: b.count <= limit, retryAfter: Math.ceil((b.resetAt - now) / 1000) };
}

export async function clientIp() {
  const h = await headers();
  return (
    h.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    h.get("x-real-ip") ||
    "local"
  );
}

/* --------------------------------------------------------------- Admin auth */

const COOKIE = "admin_session";

function sessionToken() {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return null;
  return createHash("sha256")
    .update(`${pw}:${process.env.SESSION_SECRET || "dev-secret"}`)
    .digest("hex");
}

export function adminEnabled() {
  return !!process.env.ADMIN_PASSWORD;
}

export function checkPassword(input: string) {
  const pw = process.env.ADMIN_PASSWORD;
  if (!pw) return false;
  const a = createHash("sha256").update(input).digest();
  const b = createHash("sha256").update(pw).digest();
  return timingSafeEqual(a, b);
}

export async function isAdmin() {
  const token = sessionToken();
  if (!token) return false;
  const c = (await cookies()).get(COOKIE)?.value;
  return !!c && c.length === token.length && timingSafeEqual(Buffer.from(c), Buffer.from(token));
}

export async function setAdminSession() {
  const token = sessionToken();
  if (!token) return;
  (await cookies()).set(COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
}

export async function clearAdminSession() {
  (await cookies()).delete(COOKIE);
}
