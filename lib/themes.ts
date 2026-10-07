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
    card: string; // main card surface
    text: string;
    muted: string;
    accent: string; // primary buttons ("YES", "Next")
    onAccent: string; // text on accent
    alt: string; // secondary button ("No")
    accentSoft: string; // inner panels (quiz box, gift tiles)
    deco: string[]; // decoration palette
  };
  headingFont: string;
  photoStyle: "polaroid" | "rounded" | "circle";
}

export const THEMES: Theme[] = [
  {
    id: "sweet-pink",
    name: "Sweet Pink",
    description: "Soft pink card, bold red buttons, falling petals.",
    decoration: "petals",
    colors: {
      background: "linear-gradient(180deg, #fff6f1 0%, #fdeee9 100%)",
      card: "#fcc9d6",
      text: "#2a1418",
      muted: "#6b4650",
      accent: "#e3121b",
      onAccent: "#ffffff",
      alt: "#1f2be0",
      accentSoft: "#fde0e8",
      deco: ["#f58fa9", "#fbb6c6", "#e3121b"],
    },
    headingFont: "'Playfair Display', Georgia, serif",
    photoStyle: "polaroid",
  },
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
      onAccent: "#ffffff",
      alt: "#2bb3a3",
      accentSoft: "#ffefe6",
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
      onAccent: "#151f40",
      alt: "#5a6bd8",
      accentSoft: "#222d57",
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
      onAccent: "#ffffff",
      alt: "#8b7bd8",
      accentSoft: "#f8e9f2",
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
      onAccent: "#ffffff",
      alt: "#3a86ff",
      accentSoft: "#eef7ff",
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
      onAccent: "#ffffff",
      alt: "#9a9a9a",
      accentSoft: "#f5f2ed",
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
