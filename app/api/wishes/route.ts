import { NextResponse } from "next/server";
import { wishSchema } from "@/lib/validation";
import { createWish, getActiveThemes, track } from "@/lib/repo";
import { blobs } from "@/lib/storage";
import { clientIp, rateLimit } from "@/lib/security";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`create:${ip}`, 10, 60 * 60_000).ok) {
    return NextResponse.json(
      { error: "You've created a lot of wishes in a short time. Please try again later." },
      { status: 429 },
    );
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const parsed = wishSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Invalid details." }, { status: 400 });
  }
  const input = parsed.data;

  const themes = await getActiveThemes();
  if (!themes.some((t) => t.id === input.themeId)) {
    return NextResponse.json({ error: "That design is no longer available. Please pick another." }, { status: 400 });
  }

  const exists = await Promise.all(input.photoIds.map((id) => blobs.get(id).then((b) => !!b)));
  if (exists.includes(false)) {
    return NextResponse.json({ error: "One of your photos is missing. Please upload it again." }, { status: 400 });
  }

  const wish = await createWish(input);
  track("wish_created").catch(() => {});
  return NextResponse.json({ slug: wish.slug }, { status: 201 });
}
