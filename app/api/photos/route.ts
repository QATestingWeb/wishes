import { NextResponse } from "next/server";
import { MAX_PHOTO_BYTES, rateLimit, savePhoto, sharingEnabled } from "@/lib/share";

export const runtime = "nodejs";

function fail(error: string, status = 400) {
  return NextResponse.json({ error }, { status });
}

/** Body: the raw bytes of one photo. Returns its public URL. */
export async function POST(req: Request) {
  if (!sharingEnabled()) return fail("Sharing isn't set up on this site yet.", 503);
  if (!rateLimit(req, "photo", 40)) return fail("You're sharing very quickly. Please wait a few minutes and try again.", 429);
  if (Number(req.headers.get("content-length") || 0) > MAX_PHOTO_BYTES) return fail("That photo is too large to share.", 413);

  const bytes = new Uint8Array(await req.arrayBuffer());
  if (!bytes.length) return fail("That photo is empty.");
  if (bytes.length > MAX_PHOTO_BYTES) return fail("That photo is too large to share.", 413);

  try {
    const url = await savePhoto(bytes);
    return url ? NextResponse.json({ url }) : fail("That file isn't a photo we can share. Please use a JPG, PNG or WebP image.");
  } catch (e) {
    console.error("photo upload failed", e);
    return fail("Something went wrong while saving that photo. Please try again.", 500);
  }
}
