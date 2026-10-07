import type { CSSProperties } from "react";
import type { Theme } from "@/lib/themes";

// Deterministic PRNG so server and client render identical decorations.
function rng(seed: number) {
  return () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function Decorations({ theme, animated }: { theme: Theme; animated: boolean }) {
  const r = rng(7);
  const c = theme.colors.deco;
  if (theme.decoration === "none" || c.length === 0) return null;

  const wrap = "pointer-events-none absolute inset-0 overflow-hidden";

  if (theme.decoration === "confetti") {
    return (
      <div className={wrap} aria-hidden>
        {Array.from({ length: 42 }, (_, i) => {
          const style: CSSProperties = {
            left: `${r() * 100}%`,
            top: animated ? "-5%" : `${r() * 100}%`,
            width: 6 + r() * 6,
            height: 10 + r() * 8,
            background: c[i % c.length],
            borderRadius: i % 3 === 0 ? "999px" : "2px",
            transform: `rotate(${r() * 360}deg)`,
            opacity: animated ? undefined : 0.55,
            animationDelay: `${r() * 6}s`,
            animationDuration: `${5 + r() * 5}s`,
          };
          return <span key={i} className={`absolute ${animated ? "deco-fall" : ""}`} style={style} />;
        })}
      </div>
    );
  }

  if (theme.decoration === "stars") {
    return (
      <div className={wrap} aria-hidden>
        {Array.from({ length: 36 }, (_, i) => {
          const size = 6 + r() * 12;
          return (
            <svg
              key={i}
              viewBox="0 0 24 24"
              className="deco-twinkle absolute"
              style={{
                left: `${r() * 100}%`,
                top: `${r() * 100}%`,
                width: size,
                height: size,
                animationDelay: `${r() * 4}s`,
                animationPlayState: animated ? "running" : "paused",
              }}
            >
              <path d="M12 0l2.6 9.4L24 12l-9.4 2.6L12 24l-2.6-9.4L0 12l9.4-2.6z" fill={c[i % c.length]} />
            </svg>
          );
        })}
      </div>
    );
  }

  if (theme.decoration === "petals") {
    return (
      <div className={wrap} aria-hidden>
        {Array.from({ length: 24 }, (_, i) => (
          <span
            key={i}
            className={`absolute ${animated ? "deco-drift" : ""}`}
            style={{
              left: `${r() * 100}%`,
              top: animated ? "-6%" : `${r() * 100}%`,
              width: 14 + r() * 12,
              height: 9 + r() * 7,
              background: c[i % c.length],
              borderRadius: "70% 0 70% 0",
              opacity: 0.7,
              transform: `rotate(${r() * 360}deg)`,
              animationDelay: `${r() * 8}s`,
              animationDuration: `${9 + r() * 6}s`,
            }}
          />
        ))}
      </div>
    );
  }

  // balloons — clustered along the sides so they never cover the text
  return (
    <div className={wrap} aria-hidden>
      {Array.from({ length: 10 }, (_, i) => {
        const side = i % 2 === 0 ? r() * 16 : 84 + r() * 12;
        const size = 34 + r() * 26;
        return (
          <svg
            key={i}
            viewBox="0 0 40 70"
            className={`absolute ${animated ? "deco-float" : ""}`}
            style={{
              left: `${side}%`,
              top: `${8 + r() * 80}%`,
              width: size,
              height: size * 1.75,
              marginLeft: -size / 2,
              animationDelay: `${r() * 4}s`,
              animationDuration: `${5 + r() * 3}s`,
            }}
          >
            <ellipse cx="20" cy="20" rx="17" ry="20" fill={c[i % c.length]} />
            <ellipse cx="13" cy="12" rx="4" ry="6" fill="white" opacity="0.35" />
            <path d="M17 40l3 4 3-4z" fill={c[i % c.length]} />
            <path d="M20 44 C 16 52, 24 58, 20 70" stroke={c[i % c.length]} strokeWidth="1" fill="none" opacity="0.6" />
          </svg>
        );
      })}
    </div>
  );
}
