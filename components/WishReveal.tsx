"use client";

import Link from "next/link";
import { useState } from "react";
import type { Theme } from "@/lib/themes";
import { WishCard } from "./WishCard";

interface Props {
  slug: string;
  theme: Theme;
  recipientName: string;
  senderName: string;
  message: string;
  photos: string[];
  siteName: string;
}

export function WishReveal({ slug, theme, recipientName, senderName, message, photos, siteName }: Props) {
  const [open, setOpen] = useState(false);
  const [reported, setReported] = useState<"idle" | "confirm" | "done">("idle");
  const c = theme.colors;

  async function report() {
    await fetch(`/api/wishes/${slug}/report`, { method: "POST" }).catch(() => {});
    setReported("done");
  }

  if (!open) {
    return (
      <main
        className="flex min-h-dvh flex-col items-center justify-center px-6 text-center"
        style={{ background: c.background, color: c.text }}
      >
        <p className="text-sm font-semibold tracking-[0.3em] uppercase" style={{ color: c.accent }}>
          You&apos;ve got a birthday wish
        </p>
        <h1 className="mt-3 text-4xl font-semibold break-words sm:text-5xl" style={{ fontFamily: theme.headingFont }}>
          {recipientName}
        </h1>
        <p className="mt-2" style={{ color: c.muted }}>
          from {senderName}
        </p>

        <button
          type="button"
          onClick={() => setOpen(true)}
          className="envelope-bob group mt-12 focus-visible:outline-none"
          aria-label="Open your birthday wish"
        >
          <svg viewBox="0 0 160 110" className="w-52 drop-shadow-xl transition group-hover:scale-105 sm:w-60" aria-hidden>
            <rect x="4" y="10" width="152" height="96" rx="10" fill={c.card} />
            <path d="M4 20 L80 66 L156 20" fill="none" stroke={c.accent} strokeWidth="3" opacity="0.5" />
            <path d="M4 20 Q4 10 14 10 H146 Q156 10 156 20 L80 66 Z" fill={c.accentSoft} />
            <circle cx="80" cy="62" r="13" fill={c.accent} />
            <path d="M80 69c-6-4-9-7-9-10a4.5 4.5 0 0 1 9-1 4.5 4.5 0 0 1 9 1c0 3-3 6-9 10z" fill="#fff" />
          </svg>
        </button>
        <span
          className="mt-8 rounded-full px-8 py-4 text-lg font-semibold text-white shadow-lg"
          style={{ background: c.accent, color: theme.decoration === "stars" ? "#151f40" : "#fff" }}
          role="presentation"
          onClick={() => setOpen(true)}
        >
          Tap to open
        </span>
      </main>
    );
  }

  return (
    <main className="min-h-dvh" style={{ background: c.background }}>
      <WishCard
        theme={theme}
        recipientName={recipientName}
        senderName={senderName}
        message={message}
        photos={photos}
        animated
      />
      <footer className="relative px-6 pt-4 pb-12 text-center" style={{ color: c.muted }}>
        <Link
          href="/create"
          className="inline-block rounded-full px-6 py-3 text-sm font-semibold shadow-sm"
          style={{ background: c.card, color: c.text }}
        >
          🎂 Make a birthday wish for someone
        </Link>
        <p className="mt-6 text-xs">
          Made with {siteName} ·{" "}
          {reported === "idle" && (
            <button type="button" className="underline" onClick={() => setReported("confirm")}>
              Report this page
            </button>
          )}
          {reported === "confirm" && (
            <>
              Report as inappropriate?{" "}
              <button type="button" className="font-semibold underline" onClick={report}>
                Yes, report
              </button>{" "}
              <button type="button" className="underline" onClick={() => setReported("idle")}>
                Cancel
              </button>
            </>
          )}
          {reported === "done" && <span>Thanks — we&apos;ll review it.</span>}
        </p>
      </footer>
    </main>
  );
}
