import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { WishReveal } from "@/components/WishReveal";
import { WishUnavailable } from "@/components/WishUnavailable";
import { getManagedThemes, track, updateWish } from "@/lib/repo";
import { SITE_NAME } from "@/lib/site";
import { getTheme } from "@/lib/themes";
import { lookupWish, photoUrls } from "@/lib/wish-page";

export const dynamic = "force-dynamic";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const r = await lookupWish(slug);
  const robots = { index: false, follow: false };
  if (r.status !== "ok") return { title: "Birthday wish", robots };
  const { wish } = r;
  const title = `Happy Birthday, ${wish.recipientName}! 🎉`;
  const description = `A birthday wish from ${wish.senderName}. Tap to open.`;
  return {
    title: { absolute: title },
    description,
    robots,
    openGraph: { title, description, images: [{ url: photoUrls(wish)[0] }] },
    twitter: { card: "summary_large_image", title, description },
  };
}

export default async function WishPage({ params }: Params) {
  const { slug } = await params;
  const r = await lookupWish(slug);
  if (r.status === "missing") notFound();
  if (r.status !== "ok") return <WishUnavailable status={r.status} />;
  const { wish } = r;

  // Count the view (fire-and-forget; never block rendering on analytics).
  updateWish(slug, (w) => ({ ...w, views: w.views + 1 })).catch(() => {});
  track("wish_viewed").catch(() => {});

  // A theme deactivated later still renders for wishes already created with it.
  const theme = (await getManagedThemes()).find((t) => t.id === wish.themeId) ?? getTheme(wish.themeId);

  return (
    <WishReveal
      slug={wish.slug}
      theme={theme}
      recipientName={wish.recipientName}
      senderName={wish.senderName}
      message={wish.message}
      photos={photoUrls(wish)}
      siteName={SITE_NAME}
    />
  );
}
