import { NextResponse } from "next/server";
import { parseWish, rateLimit, saveWish, sharingEnabled } from "@/lib/share";

export const runtime = "nodejs";

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Body: the wish as JSON, with photos already uploaded through /api/photos. Returns the link's slug. */
export async function POST(req: Request) {
  if (!sharingEnabled()) return fail("Sharing isn't set up on this site yet.", 503);
  if (!rateLimit(req, "wish", 10)) return fail("You're sharing very quickly. Please wait a few minutes and try again.", 429);

  const body = await req.json().catch(() => null);
  const parsed = parseWish(body);
  if ("error" in parsed) return fail(parsed.error);

  try {
    return NextResponse.json({ slug: await saveWish(parsed.wish) });
  } catch (e) {
    console.error("wish save failed", e);
    return fail("Something went wrong while creating your link. Please try again.", 500);
  }
}
