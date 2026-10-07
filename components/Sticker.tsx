/**
 * Original "Mochi" sticker character — a round little bear drawn in SVG, so
 * there are no licensing issues and it stays crisp at any size.
 */

export type Mood = "shy" | "sad" | "cry" | "cheeky" | "love" | "party" | "wish";

const BODY = "#f3d2ad";
const LINE = "#7a4a2e";
const CHEEK = "#ff9cb3";

function Heart({ x, y, s = 1, fill = "#ff5c8a" }: { x: number; y: number; s?: number; fill?: string }) {
  return (
    <path
      transform={`translate(${x} ${y}) scale(${s})`}
      d="M0 3C-1.5-1-7-1-7 3.5c0 3.5 4 6 7 8.5 3-2.5 7-5 7-8.5C7-1 1.5-1 0 3z"
      fill={fill}
    />
  );
}

export function Sticker({ mood, size = 120, animated = true }: { mood: Mood; size?: number; animated?: boolean }) {
  const eyes = (() => {
    switch (mood) {
      case "shy":
        return (
          <>
            <path d="M40 70q5 4 10 0M70 70q5 4 10 0" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <path d="M36 82l4-3M41 83l4-3M75 83l4-3M80 82l4-3" stroke={CHEEK} strokeWidth="2" strokeLinecap="round" />
          </>
        );
      case "sad":
        return (
          <>
            <circle cx="45" cy="71" r="4" fill={LINE} />
            <circle cx="75" cy="71" r="4" fill={LINE} />
            <circle cx="46.5" cy="69.5" r="1.3" fill="#fff" />
            <circle cx="76.5" cy="69.5" r="1.3" fill="#fff" />
            <path d="M38 62l9 3M82 62l-9 3" stroke={LINE} strokeWidth="2.2" strokeLinecap="round" />
            <path d="M44 78q-3 6 0 9q3-3 0-9z" fill="#7cc7ff" className={animated ? "tear-drop" : ""} />
          </>
        );
      case "cry":
        return (
          <>
            <path d="M39 67l9 4-9 4M81 67l-9 4 9 4" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M40 76q-2 10 1 22M80 76q2 10-1 22" stroke="#7cc7ff" strokeWidth="5" fill="none" strokeLinecap="round" opacity="0.85" />
          </>
        );
      case "cheeky":
        return (
          <>
            <path d="M39 71q6-5 12 0" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />
            <circle cx="75" cy="70" r="4" fill={LINE} />
            <circle cx="76.5" cy="68.5" r="1.3" fill="#fff" />
          </>
        );
      case "love":
        return (
          <>
            <Heart x={45} y={66} s={1.05} fill="#ff4f7b" />
            <Heart x={75} y={66} s={1.05} fill="#ff4f7b" />
          </>
        );
      default:
        return <path d="M39 72q6-6 12 0M69 72q6-6 12 0" stroke={LINE} strokeWidth="2.6" fill="none" strokeLinecap="round" />;
    }
  })();

  const mouth = (() => {
    switch (mood) {
      case "sad":
        return <path d="M54 91q6-5 12 0" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
      case "cry":
        return <ellipse cx="60" cy="90" rx="7" ry="6" fill="#8a3b3b" />;
      case "cheeky":
        return (
          <>
            <path d="M52 86q8 7 16 0" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />
            <path d="M58 89q3 6 6 0" fill="#ff6b8a" />
          </>
        );
      case "shy":
        return <path d="M56 87q4 3 8 0" stroke={LINE} strokeWidth="2.4" fill="none" strokeLinecap="round" />;
      default:
        return <path d="M51 84q9 10 18 0z" fill="#8a3b3b" stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" />;
    }
  })();

  return (
    <div
      className={`inline-flex items-center justify-center rounded-[22px] bg-white/70 shadow-[0_6px_20px_rgba(0,0,0,0.08)] ${animated ? "sticker-bob" : ""}`}
      style={{ width: size, height: size }}
    >
      <svg viewBox="0 0 120 120" width={size * 0.86} height={size * 0.86} aria-hidden>
        {mood === "love" && (
          <g className={animated ? "float-hearts" : ""}>
            <Heart x={30} y={24} s={0.9} />
            <Heart x={92} y={18} s={0.7} fill="#ff8fb0" />
            <Heart x={60} y={10} s={0.6} />
          </g>
        )}
        {/* ears */}
        <circle cx="33" cy="44" r="11" fill={BODY} stroke={LINE} strokeWidth="2.5" />
        <circle cx="87" cy="44" r="11" fill={BODY} stroke={LINE} strokeWidth="2.5" />
        <circle cx="33" cy="44" r="5" fill={CHEEK} opacity="0.6" />
        <circle cx="87" cy="44" r="5" fill={CHEEK} opacity="0.6" />
        {/* body */}
        <ellipse cx="60" cy="76" rx="38" ry="33" fill={BODY} stroke={LINE} strokeWidth="2.5" />
        <ellipse cx="39" cy="83" rx="6" ry="4" fill={CHEEK} opacity="0.65" />
        <ellipse cx="81" cy="83" rx="6" ry="4" fill={CHEEK} opacity="0.65" />
        {eyes}
        {mouth}
        {(mood === "party" || mood === "wish") && (
          <g>
            <path d="M48 46L60 12l12 34z" fill="#ff5c8a" stroke={LINE} strokeWidth="2" strokeLinejoin="round" />
            <path d="M52 36l14-6M55 28l9-4" stroke="#ffd34d" strokeWidth="3" strokeLinecap="round" />
            <circle cx="60" cy="12" r="5" fill="#ffd34d" stroke={LINE} strokeWidth="1.5" />
          </g>
        )}
        {mood === "party" && (
          <g>
            <rect x="12" y="20" width="5" height="9" rx="1" fill="#6c63ff" transform="rotate(-20 14 24)" />
            <rect x="100" y="28" width="5" height="9" rx="1" fill="#2bb3a3" transform="rotate(25 102 32)" />
            <circle cx="20" cy="56" r="3" fill="#ffd34d" />
            <circle cx="104" cy="60" r="3" fill="#ff5c8a" />
          </g>
        )}
      </svg>
    </div>
  );
}
