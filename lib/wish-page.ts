import "server-only";
import { cache } from "react";
import { getWish, isExpired, type Wish } from "./repo";

export type WishLookup =
  | { status: "ok"; wish: Wish }
  | { status: "missing" | "expired" | "hidden" };

export const lookupWish = cache(async (slug: string): Promise<WishLookup> => {
  const wish = await getWish(slug);
  if (!wish) return { status: "missing" };
  if (isExpired(wish)) return { status: "expired" };
  if (wish.hidden) return { status: "hidden" };
  return { status: "ok", wish };
});

export function photoUrls(w: Wish) {
  return w.photoIds.map((id) => `/api/photos/${id}`);
}
