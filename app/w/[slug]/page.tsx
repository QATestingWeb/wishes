import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Surprise } from "@/components/Surprise";
import { getOccasion } from "@/lib/occasions";
import { getWish } from "@/lib/share";
import { getTheme } from "@/lib/themes";

type Params = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params;
  const wish = await getWish(slug);
  const robots = { index: false, follow: false };
  if (!wish) return { title: "Wish not found", robots };
  // Keep the chat preview a teaser: no letter, no photos.
  const title = `${wish.recipientName}, you have a surprise! 🎁`;
  const description = `${wish.senderName} made something special just for you ${getOccasion(wish.occasionId).emoji} Tap to open.`;
  return {
    title: { absolute: title },
    description,
    robots,
    openGraph: { title, description },
    twitter: { card: "summary", title, description },
  };
}

export default async function WishPage({ params }: Params) {
  const { slug } = await params;
  const wish = await getWish(slug);
  if (!wish) notFound();

  return (
    <main>
      <Surprise
        mode="shared"
        occasionId={wish.occasionId}
        theme={getTheme(wish.themeId)}
        recipientName={wish.recipientName}
        senderName={wish.senderName}
        message={wish.message}
        photos={wish.photos.map((p) => p.url)}
        captions={wish.photos.map((p) => p.caption)}
        quiz={wish.quiz}
        className="min-h-dvh"
      />
    </main>
  );
}
