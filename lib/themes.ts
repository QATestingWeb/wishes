/**
 * Theme registry.
 *
 * A theme's *look* lives in code (so designers can version it), while its
 * *availability* (active / order / description) lives in the data store and is
 * managed from /admin. To add a new theme: add an entry here, deploy, then
 * activate it from the admin area.
 */

export type Decoration = "confetti" | "stars" | "petals" | "balloons" | "none";

export interface Theme {
  id: string;
  name: string;
  description: string;
  decoration: Decoration;
  colors: {
    background: string; // page background (any CSS background value)
    card: string; // card surface
    text: string;
    muted: string;
    accent: string;
    accentSoft: string;
    deco: string[]; // decoration palette
  };
  headingFont: string;
  photoStyle: "polaroid" | "rounded" | "circle";
}

export const THEMES: Theme[] = [
  {
    id: "confetti-pop",
    name: "Confetti Pop",
    description: "Bright, playful and full of colour.",
    decoration: "confetti",
    colors: {
      background: "radial-gradient(circle at 20% 0%, #fff4d6 0%, #ffe3d3 45%, #ffd1dc 100%)",
      card: "#fffaf3",
      text: "#2b1d16",
      muted: "#7a5d4f",
      accent: "#ef4e3a",
      accentSoft: "#ffe1d9",
      deco: ["#ef4e3a", "#f7b733", "#2bb3a3", "#6c63ff", "#ff7aa8"],
    },
    headingFont: "'Fraunces', Georgia, serif",
    photoStyle: "polaroid",
  },
  {
    id: "midnight-gold",
    name: "Midnight Gold",
    description: "Elegant navy and gold under the stars.",
    decoration: "stars",
    colors: {
      background: "radial-gradient(circle at 50% -10%, #2a3a6e 0%, #121a36 55%, #0a0f22 100%)",
      card: "#151f40",
      text: "#f6ecd2",
      muted: "#b9ad8e",
      accent: "#e3b964",
      accentSoft: "#2a3460",
      deco: ["#e3b964", "#f6ecd2", "#c79a3e"],
    },
    headingFont: "'Playfair Display', Georgia, serif",
    photoStyle: "rounded",
  },
  {
    id: "pastel-garden",
    name: "Pastel Garden",
    description: "Soft blush and lilac with falling petals.",
    decoration: "petals",
    colors: {
      background: "linear-gradient(160deg, #fdeef4 0%, #efe6fb 55%, #e4f3ef 100%)",
      card: "#fffdfe",
      text: "#3d2a44",
      muted: "#87708f",
      accent: "#c2549a",
      accentSoft: "#f8e1ee",
      deco: ["#f4a6c6", "#c9b2f2", "#a8dccb", "#ffd3b0"],
    },
    headingFont: "'Fraunces', Georgia, serif",
    photoStyle: "circle",
  },
  {
    id: "balloon-party",
    name: "Balloon Party",
    description: "Sky-blue fun with floating balloons.",
    decoration: "balloons",
    colors: {
      background: "linear-gradient(180deg, #bfe6ff 0%, #e2f4ff 60%, #fff7e6 100%)",
      card: "#ffffff",
      text: "#13304a",
      muted: "#557089",
      accent: "#ff6b4a",
      accentSoft: "#ffe7e0",
      deco: ["#ff6b4a", "#ffc93c", "#4cc9f0", "#9b5de5", "#00bb7e"],
    },
    headingFont: "'Baloo 2', 'Trebuchet MS', sans-serif",
    photoStyle: "polaroid",
  },
  {
    id: "simply-elegant",
    name: "Simply Elegant",
    description: "Clean, minimal and timeless.",
    decoration: "none",
    colors: {
      background: "#f5f2ed",
      card: "#ffffff",
      text: "#1c1c1c",
      muted: "#6b6b6b",
      accent: "#1c1c1c",
      accentSoft: "#efebe4",
      deco: [],
    },
    headingFont: "'Playfair Display', Georgia, serif",
    photoStyle: "rounded",
  },
];

export const DEFAULT_THEME_ID = THEMES[0].id;

export function getTheme(id: string | undefined): Theme {
  return THEMES.find((t) => t.id === id) ?? THEMES[0];
}
