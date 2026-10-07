import type { Metadata } from "next";
import { Creator } from "@/components/Creator";
import { findOccasion, getOccasion } from "@/lib/occasions";
import { THEMES } from "@/lib/themes";
import { LIMITS } from "@/lib/site";

export const metadata: Metadata = { title: "Create a wish" };

export default async function CreatePage({
  searchParams,
}: {
  searchParams: Promise<{ occasion?: string; theme?: string }>;
}) {
  const { occasion, theme } = await searchParams;
  const themes = THEMES;
  const initialOccasionId = findOccasion(occasion)?.id ?? null;
  const fallbackThemeId = getOccasion(initialOccasionId ?? undefined).defaultThemeId;
  const initialThemeId = themes.find((t) => t.id === theme)?.id ?? fallbackThemeId;
  return (
    <Creator
      themes={themes}
      initialOccasionId={initialOccasionId}
      initialThemeId={initialThemeId}
      limits={{
        maxPhotos: LIMITS.maxPhotos,
        maxNameLength: LIMITS.maxNameLength,
        maxMessageLength: LIMITS.maxMessageLength,
        maxQuiz: LIMITS.maxQuiz,
      }}
    />
  );
}
