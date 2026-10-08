import { randomBytes } from "node:crypto";
import { cache } from "react";
import { del, get, list, put } from "@vercel/blob";
import { findOccasion } from "./occasions";
import { LIMITS } from "./site";
import { THEMES } from "./themes";
import type { QuizItem, SharedWish } from "./wish-types";

/**
 * Server side of "Get my link": a shared wish is one JSON file plus its photos in Vercel Blob.
 * Nothing is uploaded until the creator asks for a link.
 */

/** Vercel functions accept request bodies up to 4.5 MB. */
export const MAX_PHOTO_BYTES = 4 * 1024 * 1024;

const SLUG = /^[A-Za-z0-9]{12}$/;
const PHOTO_URL = /^https:\/\/[A-Za-z0-9]+\.public\.blob\.vercel-storage\.com\/photos\/[A-Za-z0-9]+\.(jpg|png|gif|webp)$/;
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

export function sharingEnabled() {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

function randomId(length: number) {
  return Array.from(randomBytes(length), (b) => ALPHABET[b % ALPHABET.length]).join("");
}

/* ------------------------------------------------------------ Rate limiting */

// Fixed-window, per server instance — a speed bump against scripted abuse, not a hard guarantee.
const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(req: Request, action: string, limit: number, windowMs = 10 * 60_000) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";
  const key = `${action}:${ip}`;
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || b.resetAt < now) {
    if (buckets.size > 5000) for (const [k, v] of buckets) if (v.resetAt < now) buckets.delete(k);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }
  return ++b.count <= limit;
}

/* ------------------------------------------------------------------- Photos */

/** Never trust the declared MIME type — look at the actual bytes. */
function sniff(b: Uint8Array): { ext: string; type: string } | null {
  const starts = (...sig: number[]) => sig.every((v, i) => b[i] === v);
  if (starts(0xff, 0xd8, 0xff)) return { ext: "jpg", type: "image/jpeg" };
  if (starts(0x89, 0x50, 0x4e, 0x47)) return { ext: "png", type: "image/png" };
  if (starts(0x47, 0x49, 0x46, 0x38)) return { ext: "gif", type: "image/gif" };
  if (starts(0x52, 0x49, 0x46, 0x46) && b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) {
    return { ext: "webp", type: "image/webp" };
  }
  return null;
}

/** Stores one photo and returns its public URL, or null if the bytes aren't an image. */
export async function savePhoto(bytes: Uint8Array): Promise<string | null> {
  const kind = sniff(bytes);
  if (!kind) return null;
  const blob = await put(`photos/${randomId(24)}.${kind.ext}`, Buffer.from(bytes), {
    access: "public",
    contentType: kind.type,
    addRandomSuffix: false,
  });
  return blob.url;
}

/* ------------------------------------------------------------------- Wishes */

// Strip control characters and collapse runs of whitespace.
const cleanLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
const cleanText = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

function line(v: unknown, max: number, required = true): string | null {
  if (typeof v !== "string") return null;
  const s = cleanLine(v);
  return s.length > max || (required && !s) ? null : s;
}

/** Validates what the browser sent. Returns the wish to store, or a message for the creator. */
export function parseWish(body: unknown): { wish: SharedWish } | { error: string } {
  const b = (body ?? {}) as Record<string, unknown>;

  const recipientName = line(b.recipientName, LIMITS.maxNameLength);
  const senderName = line(b.senderName, LIMITS.maxNameLength);
  if (!recipientName || !senderName) return { error: "Please check both names." };

  const message = typeof b.message === "string" ? cleanText(b.message) : "";
  if (!message || message.length > LIMITS.maxMessageLength) return { error: "Please check your letter." };

  const occasion = findOccasion(typeof b.occasionId === "string" ? b.occasionId : undefined);
  const theme = THEMES.find((t) => t.id === b.themeId);
  if (!occasion || !theme) return { error: "Please choose an occasion and a design." };

  if (!Array.isArray(b.photos) || b.photos.length < 1 || b.photos.length > LIMITS.maxPhotos) {
    return { error: `Please add between 1 and ${LIMITS.maxPhotos} photos.` };
  }
  const photos: SharedWish["photos"] = [];
  for (const p of b.photos as Record<string, unknown>[]) {
    const caption = line(p?.caption ?? "", 30, false);
    if (typeof p?.url !== "string" || !PHOTO_URL.test(p.url) || caption === null) {
      return { error: "One of the photos couldn't be shared. Please try again." };
    }
    photos.push({ url: p.url, caption });
  }

  const rawQuiz = b.quiz ?? [];
  if (!Array.isArray(rawQuiz) || rawQuiz.length > LIMITS.maxQuiz) return { error: "Please check your quiz." };
  const quiz: QuizItem[] = [];
  for (const item of rawQuiz as Record<string, unknown>[]) {
    const q = line(item?.q, 120);
    const options = Array.isArray(item?.options) ? item.options.map((o) => line(o, 40)) : [];
    const answer = item?.answer;
    if (!q || options.length !== 3 || options.some((o) => !o) || !(answer === 0 || answer === 1 || answer === 2)) {
      return { error: "Please check your quiz — every question needs three answers." };
    }
    quiz.push({ q, options: options as string[], answer });
  }

  return {
    wish: {
      occasionId: occasion.id,
      themeId: theme.id,
      recipientName,
      senderName,
      message,
      photos,
      quiz,
      createdAt: new Date().toISOString(),
    },
  };
}

/** Stores the wish and returns the slug used in its link: /w/<slug>. */
export async function saveWish(wish: SharedWish): Promise<string> {
  const slug = randomId(12);
  await put(`wishes/${slug}.json`, JSON.stringify(wish), {
    access: "public",
    contentType: "application/json",
    addRandomSuffix: false,
  });
  return slug;
}

export const getWish = cache(async (slug: string): Promise<SharedWish | null> => {
  if (!SLUG.test(slug) || !sharingEnabled()) return null;
  const res = await get(`wishes/${slug}.json`, { access: "public" });
  if (!res || res.statusCode !== 200) return null;
  const wish = (await new Response(res.stream).json()) as SharedWish;
  // The daily cleanup deletes the files; this makes the link stop on time even if that run is late.
  return Date.parse(wish.createdAt) < expiryCutoff() ? null : wish;
});

/* ------------------------------------------------------------------ Cleanup */

function expiryCutoff() {
  return Date.now() - LIMITS.shareDays * 24 * 60 * 60 * 1000;
}

/** Deletes wishes and photos older than LIMITS.shareDays. Returns how many files were removed. */
export async function deleteExpired(): Promise<number> {
  const cutoff = expiryCutoff();
  const expired: string[] = [];
  let cursor: string | undefined;
  do {
    const page = await list({ cursor, limit: 1000 });
    for (const b of page.blobs) {
      const ours = b.pathname.startsWith("wishes/") || b.pathname.startsWith("photos/");
      if (ours && b.uploadedAt.getTime() < cutoff) expired.push(b.url);
    }
    cursor = page.hasMore ? page.cursor : undefined;
  } while (cursor);

  for (let i = 0; i < expired.length; i += 100) await del(expired.slice(i, i + 100));
  return expired.length;
}
