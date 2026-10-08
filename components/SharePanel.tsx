"use client";

import { useEffect, useState } from "react";
import type { Occasion } from "@/lib/occasions";

export function SharePanel({ url, recipientName, occasion }: { url: string; recipientName: string; occasion: Occasion }) {
  const [copied, setCopied] = useState(false);
  const [canNativeShare, setCanNativeShare] = useState(false);
  const title = `${occasion.greeting}, ${recipientName}!`;
  const text = `${occasion.emoji} ${recipientName}, I made something special for you! Open it here:`;

  useEffect(() => setCanNativeShare(typeof navigator !== "undefined" && !!navigator.share), []);

  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const el = document.getElementById("share-url") as HTMLInputElement | null;
      el?.select();
      document.execCommand?.("copy");
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2200);
  }

  async function nativeShare() {
    try {
      await navigator.share({ title, text, url });
    } catch {}
  }

  const btn =
    "flex h-14 items-center justify-center gap-2 rounded-2xl px-5 font-semibold transition active:scale-[0.98]";

  return (
    <div>
      <label htmlFor="share-url" className="text-sm font-semibold">
        Your link
      </label>
      <div className="mt-2 flex gap-2">
        <input
          id="share-url"
          readOnly
          value={url}
          onFocus={(e) => e.currentTarget.select()}
          className="min-w-0 flex-1 rounded-2xl border-2 border-line bg-sand/50 px-4 py-3 font-mono text-sm"
        />
        <button type="button" onClick={copy} className={`${btn} shrink-0 bg-ink text-cream hover:bg-ink/85`}>
          {copied ? "Copied!" : "Copy"}
        </button>
      </div>
      <p className="sr-only" aria-live="polite">
        {copied ? "Link copied to clipboard" : ""}
      </p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        <a
          href={`https://wa.me/?text=${encodeURIComponent(`${text} ${url}`)}`}
          target="_blank"
          rel="noopener noreferrer"
          className={`${btn} bg-[#25d366] text-white hover:bg-[#1fb957]`}
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden>
            <path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm0 18.2a8.2 8.2 0 0 1-4.2-1.2l-.3-.2-3 .8.8-2.9-.2-.3A8.2 8.2 0 1 1 12 20.2zm4.5-6.1c-.2-.1-1.5-.7-1.7-.8s-.4-.1-.6.1-.7.8-.8 1-.3.2-.5.1a6.7 6.7 0 0 1-3.3-2.9c-.3-.4.2-.4.6-1.3a.5.5 0 0 0 0-.5l-.8-1.9c-.2-.5-.4-.4-.6-.4h-.5a1 1 0 0 0-.7.3 3 3 0 0 0-.9 2.2 5.2 5.2 0 0 0 1.1 2.7 11.8 11.8 0 0 0 4.5 4c1.7.7 2.3.8 3.2.6a2.7 2.7 0 0 0 1.8-1.2 2.2 2.2 0 0 0 .1-1.3c0-.1-.2-.2-.5-.3z" />
          </svg>
          Send on WhatsApp
        </a>
        {canNativeShare ? (
          <button type="button" onClick={nativeShare} className={`${btn} border-2 border-line bg-white hover:border-ink/30`}>
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <path d="M12 3v12M7 8l5-5 5 5M5 13v6a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-6" />
            </svg>
            More ways to share
          </button>
        ) : (
          <a
            href={`mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`${text}\n\n${url}`)}`}
            className={`${btn} border-2 border-line bg-white hover:border-ink/30`}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
              <rect x="3" y="5" width="18" height="14" rx="2" />
              <path d="m3 7 9 6 9-6" />
            </svg>
            Send by email
          </a>
        )}
      </div>
    </div>
  );
}
