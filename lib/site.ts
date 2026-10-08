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
    q: "How do I send it?",
    a: "On the last step tap “Get my link”. You get a link to copy or send on WhatsApp — whoever opens it sees the full surprise on their own phone.",
  },
  {
    q: "Are my photos uploaded anywhere?",
    a: "Only when you tap “Get my link”. Until then photos are resized on your own device and stay in your browser. Getting a link uploads the wish and its photos so the other person can open it.",
  },
  {
    q: "Who can see a shared wish?",
    a: "Anyone who has the link. Links are long and random, and shared wishes are hidden from search engines.",
  },
  {
    q: "What happens if I refresh the page?",
    a: "Your draft is kept in this browser tab, so a refresh won't lose it. Closing the tab clears the draft — links you already created keep working.",
  },
  { q: "How many photos can I add?", a: "Up to 4 photos — JPG, PNG, WebP or GIF." },
  {
    q: "Can I change it after sharing?",
    a: "A link keeps playing what you shared. Change anything in the wizard, then tap “Get my link” again for a new link.",
  },
];
