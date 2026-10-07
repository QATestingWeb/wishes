export const SITE_NAME = "Wishful";
export const SITE_TAGLINE = "Personal wishes for every occasion, beautifully made in a minute.";

export function siteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
}

export const LIMITS = {
  maxPhotos: 4,
  maxNameLength: 40,
  maxMessageLength: 1500,
  maxQuiz: 5,
} as const;

export const FAQS = [
  { q: "Is it free?", a: "Yes. Creating a surprise is completely free — no sign-up needed." },
  {
    q: "Which occasions can I make a wish for?",
    a: "Birthdays, anniversaries, weddings, Eid, graduations, new babies, get well soon, thank you and more — pick one in the first step.",
  },
  {
    q: "Are my photos uploaded anywhere?",
    a: "No. Photos are resized on your own device and stay in your browser. Nothing is sent to a server.",
  },
  {
    q: "What happens if I refresh the page?",
    a: "Your wish is kept in this browser tab, so a refresh won't lose it. Closing the tab clears it.",
  },
  { q: "How many photos can I add?", a: "Up to 4 photos — JPG, PNG, WebP or GIF." },
  {
    q: "Can I change it after previewing?",
    a: "Yes — tap “Edit my wish” at the end of the surprise to go back and change anything.",
  },
];
