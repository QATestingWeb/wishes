"use client";

import type { QuizItem } from "./wish-types";

/**
 * The whole wish lives in the browser — no server, no database.
 * It's kept in sessionStorage (so a refresh doesn't lose it) with an in-memory
 * fallback in case the photos are too big for the storage quota.
 */

export interface DraftPhoto {
  key: string;
  src: string; // compressed data URL
  caption: string;
}

export interface Draft {
  step: number;
  occasionId: string;
  recipientName: string;
  senderName: string;
  message: string;
  themeId: string;
  photos: DraftPhoto[];
  quiz: QuizItem[] | null;
}

const KEY = "wish-draft-v4";
let memory: Draft | null = null;

export function loadDraft(): Draft | null {
  try {
    const raw = sessionStorage.getItem(KEY);
    if (raw) return JSON.parse(raw) as Draft;
  } catch {}
  return memory;
}

export function saveDraft(d: Draft) {
  memory = d;
  try {
    sessionStorage.setItem(KEY, JSON.stringify(d));
  } catch {
    // Quota exceeded (very large photos) — keep text-only copy so a refresh keeps at least the words.
    try {
      sessionStorage.setItem(KEY, JSON.stringify({ ...d, photos: [] }));
    } catch {}
  }
}

export function clearDraft() {
  memory = null;
  try {
    sessionStorage.removeItem(KEY);
  } catch {}
}

/** Read a picked file, shrink it and return a compact data URL — all in the browser. */
export async function photoToDataUrl(file: File, max = 1400): Promise<string> {
  let blob: Blob = file;
  if (file.type !== "image/gif") {
    const bmp = await createImageBitmap(file, { imageOrientation: "from-image" }).catch(() => null);
    if (!bmp) throw new Error("decode");
    const scale = Math.min(1, max / Math.max(bmp.width, bmp.height));
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bmp.width * scale);
    canvas.height = Math.round(bmp.height * scale);
    canvas.getContext("2d")!.drawImage(bmp, 0, 0, canvas.width, canvas.height);
    bmp.close();
    blob = (await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.85))) ?? file;
  }
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("read"));
    reader.readAsDataURL(blob);
  });
}
