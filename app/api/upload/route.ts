import { NextResponse } from "next/server";
import sharp from "sharp";
import { nanoid } from "nanoid";
import { blobs } from "@/lib/storage";
import { track } from "@/lib/repo";
import { LIMITS } from "@/lib/site";
import { clientIp, rateLimit } from "@/lib/security";

export const runtime = "nodejs";

const ALLOWED_FORMATS = new Set(["jpeg", "png", "webp", "gif", "avif", "heif"]);

function fail(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`upload:${ip}`, 30, 10 * 60_000).ok) {
    return fail("You're uploading very quickly. Please wait a few minutes and try again.", 429);
  }

  const declared = Number(req.headers.get("content-length") || 0);
  if (declared > LIMITS.maxUploadBytes + 64 * 1024) {
    return fail("That photo is too large. Please choose one under 10 MB.", 413);
  }

  let file: File | null = null;
  try {
    const form = await req.formData();
    const f = form.get("photo");
    file = f instanceof File ? f : null;
  } catch {
    return fail("We couldn't read that upload. Please try again.");
  }
  if (!file || file.size === 0) return fail("Please choose a photo to upload.");
  if (file.size > LIMITS.maxUploadBytes) {
    return fail("That photo is too large. Please choose one under 10 MB.", 413);
  }

  const input = Buffer.from(await file.arrayBuffer());

  // Never trust the file name or browser MIME type — inspect the actual bytes.
  let format: string | undefined;
  try {
    format = (await sharp(input, { limitInputPixels: 60_000_000 }).metadata()).format;
  } catch {
    return fail("That file isn't a photo we can read. Please use a JPG, PNG or WebP image.");
  }
  if (!format || !ALLOWED_FORMATS.has(format)) {
    return fail("That file type isn't supported. Please use a JPG, PNG or WebP image.");
  }

  try {
    // .rotate() applies EXIF orientation; sharp drops all metadata (incl. GPS) on output.
    const { data, info } = await sharp(input, { limitInputPixels: 60_000_000, animated: false })
      .rotate()
      .resize(LIMITS.photoMaxDimension, LIMITS.photoMaxDimension, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .webp({ quality: 80 })
      .toBuffer({ resolveWithObject: true });

    const id = nanoid(24);
    await blobs.put(id, data);
    track("photo_uploaded").catch(() => {});
    return NextResponse.json({
      id,
      url: `/api/photos/${id}`,
      width: info.width,
      height: info.height,
    });
  } catch {
    return fail("Something went wrong while processing that photo. Please try another one.", 500);
  }
}
