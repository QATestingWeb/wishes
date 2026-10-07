export const SITE_NAME = "Wishful";
export const SITE_TAGLINE = "Personal birthday wishes, beautifully made in a minute.";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const LIMITS = {
  maxPhotos: 4,
  maxUploadBytes: 10 * 1024 * 1024, // raw upload limit (server)
  maxNameLength: 40,
  maxMessageLength: 1500,
  photoMaxDimension: 1600,
  maxQuiz: 5,
} as const;

export function retentionDays(): number {
  const n = Number(process.env.WISH_RETENTION_DAYS);
  return Number.isFinite(n) && n > 0 ? n : 30;
}

export const MESSAGE_SUGGESTIONS = [
  "Happy birthday! Wishing you a year full of laughter, adventure and everything that makes you smile.",
  "Another year older, wiser and more wonderful. So grateful to have you in my life. Enjoy every moment today!",
  "Here's to you — your kindness, your laugh, and all the good things still to come. Have the best birthday!",
  "May this year bring you good health, big dreams and even bigger reasons to celebrate. Happy birthday!",
  "Happy birthday to someone who makes every day brighter. Eat the cake, make the wish, have the fun!",
];

/** Starter quiz, personalised with the sender's name when the creator opens the quiz step. */
export function defaultQuiz(sender: string) {
  const me = sender.trim() || "Me";
  return [
    { q: "Who loves you the most? 🥰", options: [me, "Your phone", "The birthday cake"], answer: 0 },
    { q: "What's the best part of today? 🎂", options: ["The cake", "The gifts", "Celebrating YOU"], answer: 2 },
  ];
}
