import { NextResponse } from "next/server";
import { cleanup } from "@/lib/repo";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Call daily from your scheduler: curl -H "Authorization: Bearer $CRON_SECRET" https://site/api/cron/cleanup
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return NextResponse.json(await cleanup());
}
