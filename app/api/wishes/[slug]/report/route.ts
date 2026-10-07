import { NextResponse } from "next/server";
import { track, updateWish } from "@/lib/repo";
import { clientIp, rateLimit } from "@/lib/security";

export const runtime = "nodejs";

// Wishes with this many reports are hidden until an admin reviews them.
const AUTO_HIDE_AT = 3;

export async function POST(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const ip = await clientIp();
  if (!rateLimit(`report:${ip}:${slug}`, 1, 24 * 3_600_000).ok) {
    return NextResponse.json({ ok: true }); // already reported — stay quiet
  }
  const w = await updateWish(slug, (w) => ({
    ...w,
    reports: w.reports + 1,
    hidden: w.hidden || w.reports + 1 >= AUTO_HIDE_AT,
  }));
  if (!w) return NextResponse.json({ error: "Not found" }, { status: 404 });
  track("wish_reported").catch(() => {});
  return NextResponse.json({ ok: true });
}
