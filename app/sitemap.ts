import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteUrl();
  return ["", "/help", "/privacy", "/terms"].map((p) => ({ url: `${base}${p}`, changeFrequency: "monthly" }));
}
