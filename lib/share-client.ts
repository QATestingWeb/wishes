"use client";

import type { Draft } from "./draft";

/** Keep in step with MAX_PHOTO_BYTES in lib/share.ts. */
const MAX_PHOTO_BYTES = 4 * 1024 * 1024;
const KEY = "wish-share-v1";

async function post(url: string, init: RequestInit): Promise<Record<string, string>> {
  let res: Response;
  try {
    res = await fetch(url, { method: "POST", ...init });
  } catch {
    throw new Error("Couldn't reach the server. Check your connection and try again.");
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
  return data;
}

async function fingerprint(text: string) {
  const hash = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return Array.from(new Uint8Array(hash), (b) => b.toString(16).padStart(2, "0")).join("");
}

/**
 * Uploads the wish and its photos and returns the link to send.
 * Asking again for an unchanged wish returns the same link without uploading twice.
 */
export async function createShareLink(draft: Draft): Promise<string> {
  const { step: _step, ...content } = draft;
  const print = await fingerprint(JSON.stringify(content)).catch(() => null);
  const link = (slug: string) => `${location.origin}/w/${slug}`;

  try {
    const last = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (print && last?.print === print) return link(last.slug);
  } catch {}

  const blobs = await Promise.all(draft.photos.map(async (p) => (await fetch(p.src)).blob()));
  const tooBig = blobs.findIndex((b) => b.size > MAX_PHOTO_BYTES);
  if (tooBig >= 0) throw new Error(`Photo ${tooBig + 1} is too large to share (max 4 MB). Please replace it.`);

  const photos = [];
  for (const [i, body] of blobs.entries()) {
    const { url } = await post("/api/photos", { body, headers: { "Content-Type": "application/octet-stream" } });
    photos.push({ url, caption: draft.photos[i].caption });
  }

  const { slug } = await post("/api/wishes", {
    body: JSON.stringify({ ...content, photos, quiz: draft.quiz ?? [] }),
    headers: { "Content-Type": "application/json" },
  });

  try {
    sessionStorage.setItem(KEY, JSON.stringify({ print, slug }));
  } catch {}
  return link(slug);
}
