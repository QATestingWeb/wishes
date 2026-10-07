import type { Metadata } from "next";
import { Creator } from "@/components/Creator";
import { getActiveThemes } from "@/lib/repo";
import { LIMITS, MESSAGE_SUGGESTIONS } from "@/lib/site";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Create a birthday wish" };

export default async function CreatePage({ searchParams }: { searchParams: Promise<{ theme?: string }> }) {
  const { theme } = await searchParams;
  const themes = await getActiveThemes();
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
      }}
    />
  );
}
