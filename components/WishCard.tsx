import type { Theme } from "@/lib/themes";
import { Decorations } from "./Decorations";

export interface WishCardProps {
  theme: Theme;
  recipientName: string;
  senderName: string;
  message: string;
  photos: string[];
  animated?: boolean;
  /** Preview mode shows friendly placeholders for empty fields. */
  preview?: boolean;
}

const TILTS = [-3, 2.5, -1.5, 3];

function PhotoFrame({ src, theme, index, single }: { src: string | null; theme: Theme; index: number; single: boolean }) {
  const shape =
    theme.photoStyle === "circle"
      ? "rounded-full aspect-square"
      : single
        ? "rounded-xl aspect-[4/5]"
        : "rounded-xl aspect-square";

  const img = src ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" className={`h-full w-full object-cover ${shape}`} draggable={false} />
  ) : (
    <div
      className={`flex h-full w-full flex-col items-center justify-center gap-1 text-xs ${shape}`}
      style={{ background: theme.colors.accentSoft, color: theme.colors.muted }}
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.6">
        <path d="M3 8a2 2 0 0 1 2-2h2l1.5-2h7L17 6h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
        <circle cx="12" cy="13" r="3.5" />
      </svg>
      Your photo
    </div>
  );

  if (theme.photoStyle === "polaroid") {
    return (
      <div
        className="bg-white p-2 pb-7 shadow-lg shadow-black/15 @md:p-3 @md:pb-10"
        style={{ transform: `rotate(${TILTS[index % TILTS.length]}deg)` }}
      >
        <div className={shape.replace("rounded-xl", "rounded-sm")}>{img}</div>
      </div>
    );
  }
  if (theme.photoStyle === "circle") {
    return (
      <div className="rounded-full p-1.5 shadow-lg shadow-black/10" style={{ background: theme.colors.card }}>
        {img}
      </div>
    );
  }
  return (
    <div className="rounded-2xl p-1 shadow-xl shadow-black/20" style={{ background: theme.colors.accent }}>
      {img}
    </div>
  );
}

export function WishCard({
  theme,
  recipientName,
  senderName,
  message,
  photos,
  animated = false,
  preview = false,
}: WishCardProps) {
  const c = theme.colors;
  const recipient = recipientName.trim() || (preview ? "Their name" : "");
  const sender = senderName.trim() || (preview ? "Your name" : "");
  const msg = message.trim() || (preview ? "Your birthday message will appear here." : "");
  const shown: (string | null)[] = photos.length ? photos : preview ? [null] : [];
  const n = shown.length;

  const grid =
    n === 1
      ? "grid-cols-1 max-w-[78%]"
      : n === 2
        ? "grid-cols-2 max-w-[92%]"
        : n === 3
          ? "grid-cols-2 max-w-[92%] [&>*:first-child]:col-span-2 [&>*:first-child]:mx-auto [&>*:first-child]:w-[62%]"
          : "grid-cols-2 max-w-[86%]";

  return (
    <div className="@container relative isolate min-h-full w-full overflow-hidden" style={{ background: c.background, color: c.text }}>
      <Decorations theme={theme} animated={animated} />

      <div className="relative mx-auto flex max-w-2xl flex-col items-center px-5 py-10 text-center @md:px-10 @md:py-16">
        <p
          className={`text-[11px] font-semibold uppercase tracking-[0.35em] @md:text-sm ${animated ? "wish-in" : ""}`}
          style={{ color: c.accent }}
        >
          Happy Birthday
        </p>
        <h1
          className={`mt-3 break-words text-5xl leading-[1.02] font-semibold @md:text-7xl ${animated ? "wish-in [animation-delay:150ms]" : ""}`}
          style={{ fontFamily: theme.headingFont, opacity: recipientName.trim() || !preview ? 1 : 0.45 }}
        >
          {recipient}
        </h1>

        {n > 0 && (
          <div className={`mt-8 grid w-full gap-4 @md:mt-10 @md:gap-6 ${grid} ${animated ? "wish-in [animation-delay:300ms]" : ""}`}>
            {shown.map((src, i) => (
              <PhotoFrame key={`${src}-${i}`} src={src} theme={theme} index={i} single={n === 1} />
            ))}
          </div>
        )}

        <div
          className={`mt-9 w-full rounded-3xl px-6 py-7 shadow-sm @md:mt-12 @md:px-10 @md:py-9 ${animated ? "wish-in [animation-delay:450ms]" : ""}`}
          style={{ background: c.card }}
        >
          <p
            className="text-lg leading-relaxed whitespace-pre-line break-words @md:text-xl"
            style={{ opacity: message.trim() || !preview ? 1 : 0.5 }}
          >
            {msg}
          </p>
          <div className="mx-auto my-5 h-px w-16" style={{ background: c.accent, opacity: 0.4 }} />
          <p className="text-sm" style={{ color: c.muted }}>
            With love,
          </p>
          <p
            className="mt-1 text-2xl font-semibold break-words @md:text-3xl"
            style={{ fontFamily: theme.headingFont, opacity: senderName.trim() || !preview ? 1 : 0.45 }}
          >
            {sender}
          </p>
        </div>
      </div>
    </div>
  );
}
