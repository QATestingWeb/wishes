import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { SharePanel } from "@/components/SharePanel";
import { SiteHeader } from "@/components/SiteChrome";
import { SurpriseThumb } from "@/components/SurpriseThumb";
import { WishUnavailable } from "@/components/WishUnavailable";
import { getTheme } from "@/lib/themes";
import { siteUrl } from "@/lib/site";
import { lookupWish } from "@/lib/wish-page";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Share your wish", robots: { index: false, follow: false } };

export default async function SharePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const r = await lookupWish(slug);
  if (r.status === "missing") notFound();
  if (r.status !== "ok") return <WishUnavailable status={r.status} />;
  const { wish } = r;
  const url = `${siteUrl()}/w/${wish.slug}`;
  const expires = new Date(wish.expiresAt).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });

  return (
    <div className="min-h-dvh bg-sand/50">
      <SiteHeader cta={false} />
      <main className="mx-auto grid max-w-5xl items-start gap-10 px-5 pt-4 pb-20 md:grid-cols-[1fr_300px] md:pt-10">
        <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-10">
          <p className="text-4xl" aria-hidden>
            🎉
          </p>
          <h1 className="mt-3 font-display text-4xl font-semibold">Your wish is ready!</h1>
          <p className="mt-3 text-ink-soft">
            Send this link to {wish.recipientName} — they’ll get a playful surprise with your letter, photos, quiz and a cake to blow out. Anyone with the link can open it, so share it only with the people you
            want to see it.
          </p>

          <div className="mt-8">
            <SharePanel url={url} recipientName={wish.recipientName} />
          </div>

          <div className="mt-8 flex flex-col gap-3 border-t border-line pt-6 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-ink-soft">Online until {expires}.</p>
            <div className="flex gap-4 text-sm font-semibold">
              <Link href={`/w/${wish.slug}`} target="_blank" className="text-coral hover:underline">
                Open it ↗
              </Link>
              <Link href="/create" className="text-ink-soft hover:text-ink">
                Create another
              </Link>
            </div>
          </div>
        </div>

        <Link
          href={`/w/${wish.slug}`}
          target="_blank"
          className="mx-auto block overflow-hidden rounded-[2rem] border-[8px] border-ink bg-ink shadow-xl transition hover:-translate-y-1"
          aria-label="Open the birthday page"
        >
          <div className="overflow-hidden rounded-[1.4rem]">
            <SurpriseThumb
              theme={getTheme(wish.themeId)}
              recipientName={wish.recipientName}
              senderName={wish.senderName}
              scale={0.7}
              height={520}
            />
          </div>
        </Link>
      </main>
    </div>
  );
}
