import { NextResponse } from "next/server";
import { deleteExpired, sharingEnabled } from "@/lib/share";

export const runtime = "nodejs";
export const maxDuration = 60;

/** Run daily by Vercel Cron (see vercel.json), which sends CRON_SECRET as a bearer token. */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!sharingEnabled()) return NextResponse.json({ deleted: 0 });

  try {
    return NextResponse.json({ deleted: await deleteExpired() });
  } catch (e) {
    console.error("cleanup failed", e);
    return NextResponse.json({ error: "Cleanup failed" }, { status: 500 });
  }
}
