import "server-only";
import { customAlphabet } from "nanoid";
import { blobs, db } from "./storage";
import { THEMES, type Theme } from "./themes";
import { retentionDays } from "./site";

/* ----------------------------------------------------------------- Wishes */

export interface Wish {
  slug: string;
  recipientName: string;
  senderName: string;
  message: string;
  photoIds: string[];
  themeId: string;
  createdAt: string;
  expiresAt: string;
  views: number;
  reports: number;
  hidden: boolean;
}

// No look-alike characters; 10 chars ≈ 8×10^14 combinations, so links can't be guessed.
const slugId = customAlphabet("23456789abcdefghjkmnpqrstuvwxyz", 10);

function slugPrefix(name: string) {
  return name
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 20);
}

export async function createWish(input: {
  recipientName: string;
  senderName: string;
  message: string;
  photoIds: string[];
  themeId: string;
}): Promise<Wish> {
  const prefix = slugPrefix(input.recipientName);
  const slug = prefix ? `${prefix}-${slugId()}` : slugId();
  const now = new Date();
  const wish: Wish = {
    slug,
    ...input,
    createdAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + retentionDays() * 86_400_000).toISOString(),
    views: 0,
    reports: 0,
    hidden: false,
  };
  await db.write("wishes", slug, wish);
  return wish;
}

export function isExpired(w: Wish) {
  return new Date(w.expiresAt).getTime() < Date.now();
}

export async function getWish(slug: string) {
  if (!/^[a-z0-9-]{4,40}$/.test(slug)) return null;
  return db.read<Wish>("wishes", slug);
}

export async function updateWish(slug: string, fn: (w: Wish) => Wish) {
  return db.update<Wish>("wishes", slug, (w) => (w ? fn(w) : null));
}

export async function deleteWish(slug: string) {
  const w = await getWish(slug);
  if (!w) return;
  await Promise.all(w.photoIds.map((id) => blobs.delete(id)));
  await db.delete("wishes", slug);
}

export async function listWishes(): Promise<Wish[]> {
  const slugs = await db.list("wishes");
  const all = await Promise.all(slugs.map((s) => db.read<Wish>("wishes", s)));
  return all
    .filter((w): w is Wish => !!w)
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* --------------------------------------------------------------- Templates */

interface TemplateSetting {
  id: string;
  active: boolean;
  order: number;
  description?: string;
}

export interface ManagedTheme extends Theme {
  active: boolean;
  order: number;
}

export async function getManagedThemes(): Promise<ManagedTheme[]> {
  const saved = (await db.read<TemplateSetting[]>("settings", "templates")) ?? [];
  return THEMES.map((t, i) => {
    const s = saved.find((x) => x.id === t.id);
    return {
      ...t,
      description: s?.description || t.description,
      active: s?.active ?? true,
      order: s?.order ?? i,
    };
  }).sort((a, b) => a.order - b.order);
}

export async function getActiveThemes() {
  return (await getManagedThemes()).filter((t) => t.active);
}

export async function saveTemplateSettings(settings: TemplateSetting[]) {
  await db.write("settings", "templates", settings);
}

/* ----------------------------------------------------------------- Content */

export interface Faq {
  q: string;
  a: string;
}

const DEFAULT_FAQS: Faq[] = [
  {
    q: "Is it free?",
    a: "Yes. Creating and sharing a birthday wish is completely free.",
  },
  {
    q: "Who can see my birthday wish?",
    a: "Only people who have the link. Wish pages are not listed anywhere or shown in search engines, and the link is long and random so it can't be guessed.",
  },
  {
    q: "How long does a wish stay online?",
    a: "Each wish stays online for 30 days, then it and its photos are deleted automatically.",
  },
  {
    q: "What photos can I upload?",
    a: "Up to 4 JPG, PNG, WebP or GIF photos, each up to 10 MB. We resize them and remove hidden location data before saving.",
  },
  {
    q: "Can I edit a wish after creating it?",
    a: "Not yet — but it only takes a minute to make a new one.",
  },
];

export async function getFaqs() {
  return (await db.read<Faq[]>("settings", "faqs")) ?? DEFAULT_FAQS;
}

export async function saveFaqs(faqs: Faq[]) {
  await db.write("settings", "faqs", faqs);
}

/* --------------------------------------------------------------- Analytics */

export const EVENT_TYPES = [
  "creator_started",
  "photo_uploaded",
  "wish_created",
  "wish_viewed",
  "share_copy",
  "share_whatsapp",
  "share_native",
  "share_email",
  "wish_reported",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

interface Stats {
  totals: Partial<Record<EventType, number>>;
  daily: Record<string, Partial<Record<EventType, number>>>;
}

export async function track(type: EventType) {
  const day = new Date().toISOString().slice(0, 10);
  await db.update<Stats>("settings", "stats", (s) => {
    const stats = s ?? { totals: {}, daily: {} };
    stats.totals[type] = (stats.totals[type] ?? 0) + 1;
    stats.daily[day] ??= {};
    stats.daily[day][type] = (stats.daily[day][type] ?? 0) + 1;
    // keep 90 days of daily buckets
    const days = Object.keys(stats.daily).sort();
    for (const d of days.slice(0, Math.max(0, days.length - 90))) delete stats.daily[d];
    return stats;
  });
}

export async function getStats(): Promise<Stats> {
  return (await db.read<Stats>("settings", "stats")) ?? { totals: {}, daily: {} };
}

/* ----------------------------------------------------------------- Cleanup */

/** Deletes expired wishes and photos that were uploaded but never used. */
export async function cleanup() {
  const wishes = await listWishes();
  let expired = 0;
  for (const w of wishes) {
    if (isExpired(w)) {
      await deleteWish(w.slug);
      expired++;
    }
  }
  const used = new Set(
    wishes.filter((w) => !isExpired(w)).flatMap((w) => w.photoIds),
  );
  const cutoff = Date.now() - 24 * 3_600_000;
  let orphans = 0;
  for (const b of await blobs.list()) {
    if (!used.has(b.key) && b.modifiedAt < cutoff) {
      await blobs.delete(b.key);
      orphans++;
    }
  }
  return { expired, orphans };
}
