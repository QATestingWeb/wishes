"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Surprise } from "@/components/Surprise";
import { loadDraft, type Draft } from "@/lib/draft";
import { getTheme } from "@/lib/themes";

export function PreviewClient() {
  const [draft, setDraft] = useState<Draft | null | undefined>(undefined);

  useEffect(() => {
    const d = loadDraft();
    setDraft(d && d.recipientName && d.photos?.length ? d : null);
  }, []);

  if (draft === undefined) return <div className="min-h-dvh" style={{ background: "#fff6f1" }} />;

  if (draft === null) {
    return (
      <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
        <p className="text-6xl" aria-hidden>
          🎈
        </p>
        <h1 className="mt-4 font-display text-3xl font-semibold">Nothing to preview yet</h1>
        <p className="mt-3 max-w-sm text-ink-soft">Create a birthday surprise first — it only takes a minute.</p>
        <Link href="/create" className="mt-8 rounded-full bg-coral px-7 py-3.5 font-semibold text-white hover:bg-coral-dark">
          Create a birthday wish
        </Link>
      </main>
    );
  }

  return (
    <main className="relative">
      <Link
        href="/create"
        className="fixed top-3 left-3 z-30 rounded-full bg-white/85 px-4 py-2 text-sm font-semibold text-ink shadow-md backdrop-blur hover:bg-white"
      >
        ← Edit
      </Link>
      <Surprise
        mode="full"
        theme={getTheme(draft.themeId)}
        recipientName={draft.recipientName}
        senderName={draft.senderName}
        message={draft.message}
        photos={draft.photos.map((p) => p.src)}
        captions={draft.photos.map((p) => p.caption)}
        quiz={draft.quiz ?? []}
        className="min-h-dvh"
      />
    </main>
  );
}
