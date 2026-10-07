import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Landing } from "@/components/Landing";
import { OCCASIONS, findOccasion } from "@/lib/occasions";

type Props = { params: Promise<{ occasion: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return OCCASIONS.map((o) => ({ occasion: o.id }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const o = findOccasion((await params).occasion);
  if (!o) return {};
  return {
    title: `${o.name} wishes — create a personal ${o.wish}`,
    description: `Make an interactive ${o.wish} with your photos, a letter and a quiz. ${o.tagline} Free, no sign-up.`,
    alternates: { canonical: `/wishes/${o.id}` },
  };
}

export default async function OccasionPage({ params }: Props) {
  const occasion = findOccasion((await params).occasion);
  if (!occasion) notFound();
  return <Landing occasion={occasion} />;
}
