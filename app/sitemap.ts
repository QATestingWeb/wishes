import type { MetadataRoute } from "next";
import { OCCASIONS } from "@/lib/occasions";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["", ...OCCASIONS.map((o) => `/wishes/${o.id}`), "/help", "/privacy", "/terms"].map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" }));
}
