"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { getOccasion, type Occasion } from "@/lib/occasions";
import type { Theme } from "@/lib/themes";
import type { QuizItem, Screen } from "@/lib/wish-types";
import { Decorations } from "./Decorations";
import { Sticker, type Mood } from "./Sticker";

/** full = the finished full-screen surprise · demo = landing page · preview = creator side panel · thumb = static thumbnail */
export type SurpriseMode = "full" | "demo" | "preview" | "thumb";

export interface SurpriseProps {
  theme: Theme;
  /** An id from lib/occasions — it decides the wording and the finale. */
  occasionId: string;
  recipientName: string;
  senderName: string;
  message: string;
  photos: string[];
  captions?: string[];
  quiz?: QuizItem[];
  mode: SurpriseMode;
  /** Creator preview: jump to the screen that matches the step being edited. */
  forcedScreen?: Screen;
  className?: string;
}

const NO_STEPS: { title: (n: string, o: Occasion) => string; sub: (s: string) => string; mood: Mood }[] = [
  {
    title: (n, o) => `${n}, are you ready for ${o.surprise}? 🥺`,
    sub: (s) => `${s} made something special, just for you.`,
    mood: "shy",
  },
  { title: () => "Think again 😢", sub: () => "It took a lot of love to make this… pleeease?", mood: "sad" },
  { title: () => "Are you really sure? 🥹", sub: () => "Don't break my little heart…", mood: "cry" },
  { title: () => "See this 😏", sub: () => "Okay, there's only one button now.", mood: "cheeky" },
];

const PAPER = { background: "#fffde9", color: "#2d2a26" };

export function Surprise({
  theme,
  occasionId,
  recipientName,
  senderName,
  message,
  photos,
  captions = [],
  quiz = [],
  mode,
  forcedScreen,
  className = "",
}: SurpriseProps) {
  const c = theme.colors;
  const occasion = getOccasion(occasionId);
  const isPreview = mode === "preview";
  const isThumb = mode === "thumb";
  const animated = !isThumb;

  const name = recipientName.trim() || (isPreview || isThumb ? "Their name" : "");
  const sender = senderName.trim() || (isPreview || isThumb ? "You" : "");
  const msg = message.trim() || (isPreview ? "Your message will appear here as a letter." : "");
  const pics = photos.length ? photos : isPreview || isThumb ? ["/sample-cake.svg"] : [];

  const [screen, setScreen] = useState<Screen>(forcedScreen ?? "ask");
  const [noCount, setNoCount] = useState(0);
  const [noOffset, setNoOffset] = useState({ x: 0, y: 0 });
  const [visited, setVisited] = useState<Set<Screen>>(new Set());
  const [burst, setBurst] = useState(0);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (forcedScreen) {
      setScreen(forcedScreen);
      if (forcedScreen === "ask") setNoCount(0);
    }
  }, [forcedScreen]);

  function go(next: Screen) {
    if (["letter", "photos", "quiz"].includes(next)) setVisited((v) => new Set(v).add(next));
    setScreen(next);
    rootRef.current?.scrollTo?.({ top: 0 });
    if (mode === "full" || mode === "demo") window.scrollTo({ top: 0, behavior: "smooth" });
  }

  const btn = (style: CSSProperties = {}) => ({
    className:
      "inline-flex items-center justify-center rounded-full font-bold uppercase tracking-wide shadow-md transition-[transform,font-size,padding] duration-300 active:scale-95",
    style: { background: c.accent, color: c.onAccent, ...style },
  });

  const BackButton = () => (
    <button type="button" onClick={() => go("hub")} {...btn({ fontSize: 13, padding: "0.6em 1.6em" })}>
      ← Back
    </button>
  );

  /* ------------------------------------------------------------ screens */

  let content: ReactNode;

  if (screen === "ask") {
    const step = NO_STEPS[Math.min(noCount, NO_STEPS.length - 1)];
    const yesSize = Math.min(15 + noCount * 9, 46);
    const noSize = Math.max(14 - noCount * 3, 9);
    const noHidden = noCount >= NO_STEPS.length - 1;
    content = (
      <>
        <Sticker mood={step.mood} size={112} animated={animated} />
        <h1 className="mt-5 text-[26px] leading-tight font-bold @md:text-4xl" style={{ fontFamily: theme.headingFont }}>
          {step.title(name, occasion)}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm @md:text-base" style={{ color: c.muted }}>
          {step.sub(sender)}
        </p>
        <div className="mt-7 flex min-h-16 flex-wrap items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => {
              setBurst((b) => b + 1);
              go("yay");
            }}
            {...btn({ fontSize: yesSize, padding: "0.55em 1.8em" })}
          >
            Yes
          </button>
          {!noHidden && (
            <button
              type="button"
              onClick={() => {
                setNoCount((n) => n + 1);
                setNoOffset({ x: 0, y: 0 });
              }}
              onPointerEnter={(e) => {
                // On desktop, the "No" button nervously scoots away.
                if (e.pointerType === "mouse" && noCount > 0) {
                  setNoOffset({ x: (Math.random() - 0.5) * 120, y: (Math.random() - 0.5) * 40 });
                }
              }}
              className="inline-flex items-center justify-center rounded-full font-bold uppercase shadow-md transition-all duration-300"
              style={{
                background: c.alt,
                color: "#fff",
                fontSize: noSize,
                padding: "0.55em 1.5em",
                transform: `translate(${noOffset.x}px, ${noOffset.y}px)`,
              }}
            >
              No
            </button>
          )}
        </div>
      </>
    );
  }

  if (screen === "yay") {
    content = (
      <>
        <Sticker mood="party" size={112} animated={animated} />
        <h1 className="mt-5 text-[30px] leading-tight font-bold @md:text-5xl" style={{ fontFamily: theme.headingFont }}>
          {occasion.greeting}, {name}! {occasion.emoji}
        </h1>
        <p className="mx-auto mt-3 max-w-sm text-sm @md:text-base" style={{ color: c.muted }}>
          {occasion.yaySub}
        </p>
        <div className="mt-7">
          <button type="button" onClick={() => go("hub")} {...btn({ fontSize: 14, padding: "0.7em 1.8em" })}>
            See your gifts →
          </button>
        </div>
      </>
    );
  }

  if (screen === "hub") {
    const gifts: { id: Screen; label: string; mood: Mood }[] = [
      { id: "letter", label: "A Letter", mood: "love" },
      { id: "photos", label: "Memories", mood: "cheeky" },
      ...(quiz.length ? [{ id: "quiz" as Screen, label: occasion.quizLabel, mood: "shy" as Mood }] : []),
    ];
    content = (
      <>
        <h1 className="text-[26px] leading-tight font-bold @md:text-4xl" style={{ fontFamily: theme.headingFont }}>
          Something for you, {name} 🎁
        </h1>
        <p className="mt-2 text-sm" style={{ color: c.muted }}>
          Open each gift, then tap “Finally”.
        </p>
        <div className={`mt-6 grid gap-3 ${gifts.length === 3 ? "grid-cols-3" : "grid-cols-2"}`}>
          {gifts.map((g) => (
            <button
              key={g.id}
              type="button"
              onClick={() => go(g.id)}
              className="relative flex flex-col items-center gap-2 rounded-2xl px-2 py-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              style={{ background: c.accentSoft }}
            >
              <Sticker mood={g.mood} size={58} animated={false} />
              <span className="text-[13px] font-semibold @md:text-sm" style={{ fontFamily: theme.headingFont }}>
                {g.label}
              </span>
              {visited.has(g.id) && (
                <span
                  className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold"
                  style={{ background: c.accent, color: c.onAccent }}
                >
                  ✓
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="mt-7">
          <button type="button" onClick={() => go("finale")} {...btn({ fontSize: 14, padding: "0.7em 1.8em" })}>
            Finally… →
          </button>
        </div>
      </>
    );
  }

  if (screen === "letter") {
    content = (
      <>
        <h1 className="text-[26px] leading-tight font-bold @md:text-4xl" style={{ fontFamily: theme.headingFont }}>
          A Letter For You 🥺
        </h1>
        <div
          className="mx-auto mt-6 w-full max-w-md rounded-sm px-5 py-6 text-left shadow-lg @md:px-8"
          style={{
            ...PAPER,
            fontFamily: "'Caveat', 'Segoe Print', cursive",
            // ruled lines sit under each 32px text row
            backgroundImage: "repeating-linear-gradient(transparent 0 30px, #e6dcb8 30px 31px, transparent 31px 32px)",
            backgroundPosition: "0 24px",
          }}
        >
          <p className="text-2xl leading-8">Dear {name},</p>
          <Typewriter text={msg} instant={isPreview || isThumb} className="text-[22px] leading-8 whitespace-pre-line break-words" />
          <p className="mt-8 text-2xl leading-8">{occasion.signoff[0]}</p>
          <p className="text-2xl leading-8 font-bold">{sender}</p>
        </div>
        <div className="mt-6">
          <BackButton />
        </div>
      </>
    );
  }

  if (screen === "photos") {
    content = (
      <>
        <h1 className="text-[26px] leading-tight font-bold @md:text-4xl" style={{ fontFamily: theme.headingFont }}>
          Memories with you 📸
        </h1>
        <div className={`mx-auto mt-6 grid gap-4 ${pics.length === 1 ? "max-w-[260px] grid-cols-1" : "grid-cols-2"}`}>
          {pics.map((src, i) => (
            <figure
              key={`${src}-${i}`}
              className="bg-white p-2 pb-1 shadow-lg wish-in"
              style={{ transform: `rotate(${[-2.5, 2, -1.5, 2.5][i % 4]}deg)`, animationDelay: `${i * 120}ms` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={captions[i] || ""} className="aspect-square w-full object-cover" draggable={false} />
              <figcaption className="h-8 truncate pt-1 text-center text-xl leading-7 text-[#3a2f2a]" style={{ fontFamily: "'Caveat', cursive" }}>
                {captions[i] || ""}
              </figcaption>
            </figure>
          ))}
        </div>
        <div className="mt-7">
          <BackButton />
        </div>
      </>
    );
  }

  if (screen === "quiz") {
    content = (
      <>
        <h1 className="text-[26px] leading-tight font-bold @md:text-4xl" style={{ fontFamily: theme.headingFont }}>
          Quiz for you 😚
        </h1>
        <Quiz items={quiz} theme={theme} label={occasion.quizLabel} />
        <div className="mt-6">
          <BackButton />
        </div>
      </>
    );
  }

  if (screen === "finale") {
    content = (
      <Finale
        theme={theme}
        occasion={occasion}
        name={name}
        sender={sender}
        photo={pics[0]}
        mode={mode}
        onBurst={() => setBurst((b) => b + 1)}
        onReplay={() => {
          setNoCount(0);
          setVisited(new Set());
          go("ask");
        }}
      />
    );
  }

  return (
    <div
      ref={rootRef}
      className={`@container relative isolate flex w-full flex-col items-center justify-center overflow-hidden px-3 py-6 @md:px-6 ${className}`}
      style={{ background: c.background, color: c.text }}
    >
      <Decorations theme={theme} animated={animated} />
      {burst > 0 && animated && <ConfettiBurst key={burst} colors={[c.accent, ...c.deco, "#ffd34d", "#6c63ff"]} />}

      <div
        key={screen}
        className={`relative w-full max-w-[580px] rounded-[28px] px-5 py-9 text-center shadow-[0_18px_50px_-20px_rgba(0,0,0,0.25)] @md:px-10 @md:py-12 ${animated ? "screen-in" : ""}`}
        style={{ background: c.card }}
      >
        {content}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Quiz */

function Quiz({ items, theme, label }: { items: QuizItem[]; theme: Theme; label: string }) {
  const c = theme.colors;
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [wrong, setWrong] = useState<number | null>(null);
  const done = i >= items.length;

  if (!items.length) {
    return (
      <p className="mt-6 text-sm" style={{ color: c.muted }}>
        No questions yet — this gift is hidden until you add one.
      </p>
    );
  }

  if (done) {
    return (
      <div className="mx-auto mt-6 max-w-sm rounded-2xl px-5 py-6 wish-in" style={{ background: c.accentSoft }}>
        <p className="text-4xl">🎉</p>
        <p className="mt-2 font-semibold">Yay! You passed the {label}!</p>
        <p className="mt-1 text-sm" style={{ color: c.muted }}>
          {items.length}/{items.length} — you know it all 💖
        </p>
      </div>
    );
  }

  const item = items[i];
  function choose(k: number) {
    if (picked !== null) return;
    if (k === item.answer) {
      setPicked(k);
      setWrong(null);
      setTimeout(() => {
        setPicked(null);
        setI((x) => x + 1);
      }, 1100);
    } else {
      setWrong(k);
    }
  }

  return (
    <div key={i} className="mx-auto mt-6 max-w-sm rounded-2xl px-4 py-5 shadow-sm wish-in" style={{ background: c.accentSoft }}>
      <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: c.muted }}>
        Question {i + 1} of {items.length}
      </p>
      <p className="mt-2 font-semibold break-words" style={{ fontFamily: theme.headingFont }}>
        {item.q}
      </p>
      <div className="mt-4 space-y-2">
        {item.options.map((o, k) => {
          const isRight = picked === k;
          const isWrong = wrong === k;
          return (
            <button
              key={`${i}-${k}`}
              type="button"
              onClick={() => choose(k)}
              className={`block w-full rounded-lg px-3 py-2.5 text-sm font-medium break-words transition ${isWrong ? "quiz-shake" : ""}`}
              style={{
                background: isRight ? c.accent : isWrong ? "#ffd6d6" : "#ffffff",
                color: isRight ? c.onAccent : "#2a1418",
              }}
            >
              {o}
            </button>
          );
        })}
      </div>
      <p className="mt-3 h-5 text-sm font-semibold" style={{ color: c.accent }} aria-live="polite">
        {picked !== null ? "Correct! You're so smart 💖" : wrong !== null ? "Oops, please try again 😜" : ""}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------- Finale */

function Finale({
  theme,
  occasion,
  name,
  sender,
  photo,
  mode,
  onBurst,
  onReplay,
}: {
  theme: Theme;
  occasion: Occasion;
  name: string;
  sender: string;
  photo?: string;
  mode: SurpriseMode;
  onBurst: () => void;
  onReplay: () => void;
}) {
  const c = theme.colors;
  const [blown, setBlown] = useState(false);
  const [revealed, setRevealed] = useState(false);

  function blow() {
    if (blown) return;
    setBlown(true);
    onBurst();
    setTimeout(() => setRevealed(true), 1100);
  }

  if (!revealed) {
    const cake = occasion.finale === "cake";
    const copy = FINALE_COPY[occasion.finale];
    return (
      <>
        <h1 className="text-[26px] leading-tight font-bold @md:text-4xl" style={{ fontFamily: theme.headingFont }}>
          {copy.title} {name} ✨
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm" style={{ color: c.muted }}>
          {blown ? copy.after : copy.prompt}
        </p>
        <button type="button" onClick={blow} className="mx-auto mt-4 block" aria-label={copy.aria}>
          {cake ? <Cake out={blown} /> : <GiftBox open={blown} accent={c.accent} />}
        </button>
        {!blown && (
          <button
            type="button"
            onClick={blow}
            className="mt-2 rounded-full px-7 py-3 text-sm font-bold uppercase shadow-md"
            style={{ background: c.accent, color: c.onAccent }}
          >
            {copy.button}
          </button>
        )}
      </>
    );
  }

  const frame =
    theme.photoStyle === "circle"
      ? "aspect-square rounded-full border-[6px] border-white"
      : theme.photoStyle === "rounded"
        ? "aspect-[4/5] rounded-2xl"
        : "aspect-[4/5] border-[8px] border-b-[28px] border-white";

  return (
    <>
      <h1 className="text-[28px] leading-tight font-bold wish-in @md:text-5xl" style={{ fontFamily: theme.headingFont }}>
        {occasion.greeting}, {name}! 💖
      </h1>
      {photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={photo}
          alt=""
          className={`mx-auto mt-6 w-[68%] max-w-[300px] object-cover shadow-xl wish-in ${frame}`}
          style={{ animationDelay: "200ms", transform: theme.photoStyle === "polaroid" ? "rotate(-2deg)" : undefined }}
        />
      )}
      <p className="mt-6 text-sm wish-in" style={{ color: c.muted, animationDelay: "400ms" }}>
        {occasion.signoff[1]}
      </p>
      <p className="text-2xl font-bold wish-in @md:text-3xl" style={{ fontFamily: theme.headingFont, animationDelay: "450ms" }}>
        {sender}
      </p>
      <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
        <button
          type="button"
          onClick={onReplay}
          className="rounded-full border-2 px-5 py-2.5 text-sm font-semibold"
          style={{ borderColor: c.accent, color: c.text }}
        >
          ↺ Watch again
        </button>
        {(mode === "full" || mode === "demo") && (
          <Link
            href={mode === "demo" ? `/create?occasion=${occasion.id}` : "/create"}
            className="rounded-full px-5 py-2.5 text-sm font-semibold shadow-md"
            style={{ background: c.accent, color: c.onAccent }}
          >
            {mode === "demo" ? `${occasion.emoji} Make one like this` : "✏️ Edit my wish"}
          </Link>
        )}
      </div>
    </>
  );
}

const FINALE_COPY = {
  cake: {
    title: "Make a wish,",
    prompt: "Close your eyes, make a wish, then tap the cake to blow out the candles.",
    after: "Your wish is on its way…",
    button: "Blow 🌬️",
    aria: "Blow out the candles",
  },
  gift: {
    title: "One last thing,",
    prompt: "There's one more gift waiting for you. Tap it to open.",
    after: "Opening…",
    button: "Open 🎁",
    aria: "Open the gift",
  },
} as const;

function GiftBox({ open, accent }: { open: boolean; accent: string }) {
  return (
    <svg viewBox="0 0 200 190" className="w-52 @md:w-60" aria-hidden>
      <ellipse cx="100" cy="176" rx="76" ry="10" fill="#000" opacity="0.08" />
      {open &&
        [60, 100, 140].map((x, i) => (
          <path
            key={x}
            d={`M${x} 78c-6-8 6-12 0-20s6-10 0-18`}
            stroke="#ffd34d"
            strokeWidth="3"
            fill="none"
            strokeLinecap="round"
            className="smoke"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      <rect x="40" y="92" width="120" height="80" rx="10" fill="#fff4ea" />
      <rect x="90" y="92" width="20" height="80" fill={accent} />
      <g
        style={{
          transform: open ? "translate(22px, -40px) rotate(-16deg)" : "none",
          transformOrigin: "100px 80px",
          transition: "transform 0.6s cubic-bezier(0.3, 1.4, 0.5, 1)",
        }}
      >
        <rect x="32" y="70" width="136" height="28" rx="8" fill="#ffe6d2" />
        <rect x="90" y="70" width="20" height="28" fill={accent} />
        <path d="M100 70c-28-34-52-8-24 0zM100 70c28-34 52-8 24 0z" fill={accent} />
        <circle cx="100" cy="68" r="7" fill={accent} />
      </g>
    </svg>
  );
}

function Cake({ out }: { out: boolean }) {
  const candles = [70, 100, 130];
  return (
    <svg viewBox="0 0 200 190" className="w-52 @md:w-60" aria-hidden>
      <ellipse cx="100" cy="176" rx="82" ry="10" fill="#000" opacity="0.08" />
      <rect x="30" y="112" width="140" height="60" rx="12" fill="#fff4ea" />
      <path d="M30 128q12 12 23 0t23 0 24 0 23 0 23 0 24 0v-6a12 12 0 0 0-12-12H42a12 12 0 0 0-12 12z" fill="#ff7aa0" />
      <rect x="50" y="70" width="100" height="46" rx="10" fill="#fff4ea" />
      <path d="M50 84q8 9 17 0t17 0 16 0 17 0 16 0 17 0v-4a10 10 0 0 0-10-10H60a10 10 0 0 0-10 10z" fill="#ffd34d" />
      {[48, 76, 104, 132, 160].map((x) => (
        <circle key={x} cx={x} cy={152} r={4} fill="#e3121b" opacity="0.8" />
      ))}
      {candles.map((x, i) => (
        <g key={x}>
          <rect x={x - 4} y={36} width={8} height={36} rx={3} fill={["#6c63ff", "#ff5c8a", "#2bb3a3"][i]} />
          <path d={`M${x - 4} 46l8-5M${x - 4} 58l8-5`} stroke="#fff" strokeWidth="2" opacity="0.6" />
          {!out ? (
            <g className="flame" style={{ transformOrigin: `${x}px 34px`, animationDelay: `${i * 0.2}s` }}>
              <ellipse cx={x} cy={24} rx={7} ry={12} fill="#ffb627" opacity="0.35" />
              <path d={`M${x} 12c6 8 6 14 0 20-6-6-6-12 0-20z`} fill="#ffcf3f" />
              <path d={`M${x} 20c3 4 3 7 0 10-3-3-3-6 0-10z`} fill="#fff6c9" />
            </g>
          ) : (
            <path
              d={`M${x} 34c-6-8 6-12 0-20s6-10 0-18`}
              stroke="#9a9a9a"
              strokeWidth="2.5"
              fill="none"
              strokeLinecap="round"
              className="smoke"
              style={{ animationDelay: `${i * 0.15}s` }}
            />
          )}
        </g>
      ))}
    </svg>
  );
}

/* ----------------------------------------------------------- Helpers */

function Typewriter({ text, instant, className }: { text: string; instant: boolean; className?: string }) {
  const [n, setN] = useState(instant ? text.length : 0);
  useEffect(() => {
    if (instant) {
      setN(text.length);
      return;
    }
    setN(0);
    const step = Math.max(1, Math.round(text.length / 250)); // ~4s max for long letters
    const id = setInterval(() => {
      setN((x) => {
        if (x >= text.length) {
          clearInterval(id);
          return x;
        }
        return Math.min(text.length, x + step);
      });
    }, 22);
    return () => clearInterval(id);
  }, [text, instant]);

  const typing = n < text.length;
  return (
    <p className={className} onClick={() => setN(text.length)}>
      {text.slice(0, n)}
      {typing && <span className="caret">|</span>}
      {/* reserve the final height so the page doesn't jump while typing */}
      {typing && <span className="invisible">{text.slice(n)}</span>}
    </p>
  );
}

function ConfettiBurst({ colors }: { colors: string[] }) {
  const pieces = useMemo(
    () =>
      Array.from({ length: 70 }, (_, i) => ({
        left: Math.random() * 100,
        w: 6 + Math.random() * 6,
        h: 9 + Math.random() * 9,
        delay: Math.random() * 0.5,
        dur: 2.2 + Math.random() * 1.8,
        color: colors[i % colors.length],
        round: i % 3 === 0,
        drift: (Math.random() - 0.5) * 160,
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );
  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden" aria-hidden>
      {pieces.map((p, i) => (
        <span
          key={i}
          className="burst-piece absolute -top-4"
          style={
            {
              left: `${p.left}%`,
              width: p.w,
              height: p.h,
              background: p.color,
              borderRadius: p.round ? 999 : 2,
              animationDelay: `${p.delay}s`,
              animationDuration: `${p.dur}s`,
              "--drift": `${p.drift}px`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}
