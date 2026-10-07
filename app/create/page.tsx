import type { Metadata } from "next";
import { Creator } from "@/components/Creator";
import { THEMES } from "@/lib/themes";
import { LIMITS, MESSAGE_SUGGESTIONS } from "@/lib/site";

export const metadata: Metadata = { title: "Create a birthday wish" };

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await searchParams;
  const themes = THEMES;
  const initialThemeId = themes.find((t) => t.id === theme)?.id ?? themes[0]?.id ?? "";
  return (
    <Creator
      themes={themes}
      initialThemeId={initialThemeId}
      suggestions={MESSAGE_SUGGESTIONS}
      limits={{
        maxPhotos: LIMITS.maxPhotos,
        maxNameLength: LIMITS.maxNameLength,
        maxMessageLength: LIMITS.maxMessageLength,
        maxQuiz: LIMITS.maxQuiz,
      }}
    />
  );
}
