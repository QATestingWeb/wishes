import type { QuizItem } from "./wish-types";

/**
 * Occasion registry.
 *
 * Every occasion plays the same surprise (ask → gifts → finale); an occasion only
 * supplies the words, the starter content and which finale to use. To add a new
 * occasion: add an entry here — the landing page, /wishes/[occasion], the wizard
 * and the sitemap all pick it up automatically.
 */

export interface Occasion {
  id: string; // also the URL slug: /wishes/<id>
  name: string;
  emoji: string;
  /** Lower-case noun used in buttons and titles: "Create your <wish>". */
  wish: string;
  /** Shown as "<greeting>, <name>!" on the celebration screens. */
  greeting: string;
  /** Completes "<name>, are you ready for …?" on the opening screen. */
  surprise: string;
  tagline: string;
  recipientLabel: string;
  recipientPlaceholder: string;
  yaySub: string;
  quizLabel: string;
  /** [end of the letter, final screen] */
  signoff: [string, string];
  /** cake = make a wish and blow out the candles · gift = tap to open one last gift */
  finale: "cake" | "gift";
  defaultThemeId: string;
  suggestions: string[];
  /** Starter quiz, personalised with the sender's name when the creator opens the quiz step. */
  quiz: (sender: string) => QuizItem[];
}

const me = (sender: string) => sender.trim() || "Me";

export const OCCASIONS: Occasion[] = [
  {
    id: "birthday",
    name: "Birthday",
    emoji: "🎂",
    wish: "birthday wish",
    greeting: "Happy Birthday",
    surprise: "your birthday surprise",
    tagline: "Cake, candles and a wish to make.",
    recipientLabel: "Birthday person's name",
    recipientPlaceholder: "e.g. Ayesha",
    yaySub: "Every moment with you deserves a celebration — and today, it's all about you.",
    quizLabel: "Birthday Quiz",
    signoff: ["Forever yours,", "With all my love,"],
    finale: "cake",
    defaultThemeId: "sweet-pink",
    suggestions: [
      "Happy birthday! Wishing you a year full of laughter, adventure and everything that makes you smile.",
      "Another year older, wiser and more wonderful. So grateful to have you in my life. Enjoy every moment today!",
      "Here's to you — your kindness, your laugh, and all the good things still to come. Have the best birthday!",
      "May this year bring you good health, big dreams and even bigger reasons to celebrate. Happy birthday!",
      "Happy birthday to someone who makes every day brighter. Eat the cake, make the wish, have the fun!",
    ],
    quiz: (s) => [
      { q: "Who loves you the most? 🥰", options: [me(s), "Your phone", "The birthday cake"], answer: 0 },
      { q: "What's the best part of today? 🎂", options: ["The cake", "The gifts", "Celebrating YOU"], answer: 2 },
    ],
  },
  {
    id: "anniversary",
    name: "Anniversary",
    emoji: "💍",
    wish: "anniversary wish",
    greeting: "Happy Anniversary",
    surprise: "your anniversary surprise",
    tagline: "Celebrate your years together.",
    recipientLabel: "Their name",
    recipientPlaceholder: "e.g. Ayesha, or Ali & Sara",
    yaySub: "Another year of us — and I'd choose you all over again.",
    quizLabel: "Our Quiz",
    signoff: ["Forever yours,", "With all my love,"],
    finale: "cake",
    defaultThemeId: "midnight-gold",
    suggestions: [
      "Happy anniversary! Every year with you is my favourite one yet. Here's to all the years still to come.",
      "Thank you for the laughs, the patience and the love. I'd choose you again in every lifetime. Happy anniversary!",
      "From our first day to today, you've been my best decision. Happy anniversary, my love.",
    ],
    quiz: (s) => [
      { q: "Who said “I love you” first? 🥰", options: [me(s), "You did", "We'll never agree"], answer: 0 },
      { q: "What's our secret to staying happy? 💍", options: ["Good food", "Lots of laughs", "Each other"], answer: 2 },
    ],
  },
  {
    id: "wedding",
    name: "Wedding",
    emoji: "💐",
    wish: "wedding wish",
    greeting: "Congratulations",
    surprise: "your wedding surprise",
    tagline: "For the happy couple's big day.",
    recipientLabel: "The couple's names",
    recipientPlaceholder: "e.g. Ali & Sara",
    yaySub: "Two hearts, one beautiful new beginning. We couldn't be happier for you.",
    quizLabel: "Wedding Quiz",
    signoff: ["With love,", "With love and prayers,"],
    finale: "gift",
    defaultThemeId: "simply-elegant",
    suggestions: [
      "Congratulations on your wedding! Wishing you a lifetime of love, laughter and happily ever after.",
      "May your home be full of joy, your days full of kindness and your love grow stronger every year.",
      "So happy to celebrate this day with you both. Here's to a beautiful journey together!",
    ],
    quiz: (s) => [
      { q: "Who is happiest for you today? 🥰", options: [me(s), "The caterer", "The photographer"], answer: 0 },
      { q: "What makes a marriage last? 💐", options: ["Matching outfits", "Love and patience", "A big TV"], answer: 1 },
    ],
  },
  {
    id: "eid",
    name: "Eid",
    emoji: "🌙",
    wish: "Eid wish",
    greeting: "Eid Mubarak",
    surprise: "your Eid surprise",
    tagline: "Send Eid Mubarak with love.",
    recipientLabel: "Their name",
    recipientPlaceholder: "e.g. Ayesha, or The Khan Family",
    yaySub: "May this Eid fill your home with peace, joy and countless blessings.",
    quizLabel: "Eid Quiz",
    signoff: ["With love and duas,", "With love and duas,"],
    finale: "gift",
    defaultThemeId: "midnight-gold",
    suggestions: [
      "Eid Mubarak! May Allah accept your prayers and fill your life with happiness, health and peace.",
      "Wishing you and your family a joyful Eid full of blessings, good food and beautiful moments together.",
      "Eid Mubarak to someone very special. Thank you for being a blessing in my life.",
    ],
    quiz: (s) => [
      { q: "Who is sending you the most duas today? 🤲", options: [me(s), "Your neighbour", "The tailor"], answer: 0 },
      { q: "What's the best part of Eid? 🌙", options: ["Eidi", "Sheer khurma", "Being together"], answer: 2 },
    ],
  },
  {
    id: "love",
    name: "Love",
    emoji: "💖",
    wish: "love note",
    greeting: "I love you",
    surprise: "a little surprise",
    tagline: "Valentine's, or just because.",
    recipientLabel: "Their name",
    recipientPlaceholder: "e.g. Ayesha",
    yaySub: "No special reason — you're simply my favourite person in the whole world.",
    quizLabel: "Love Quiz",
    signoff: ["Forever yours,", "With all my love,"],
    finale: "gift",
    defaultThemeId: "sweet-pink",
    suggestions: [
      "I don't say it enough: you make my whole world brighter. I love you more than words can say.",
      "Every day with you is my favourite day. Thank you for being mine.",
      "You're my calm, my chaos and my home. I love you — today, tomorrow and always.",
    ],
    quiz: (s) => [
      { q: "Who loves you the most? 🥰", options: [me(s), "Your phone", "Your bed"], answer: 0 },
      { q: "What's my favourite place? 💖", options: ["The beach", "The mountains", "Next to you"], answer: 2 },
    ],
  },
  {
    id: "graduation",
    name: "Graduation",
    emoji: "🎓",
    wish: "graduation wish",
    greeting: "Congratulations",
    surprise: "your graduation surprise",
    tagline: "They did it — make it loud.",
    recipientLabel: "Graduate's name",
    recipientPlaceholder: "e.g. Ayesha",
    yaySub: "All those late nights paid off. You did it — and we're so proud of you!",
    quizLabel: "Graduate Quiz",
    signoff: ["So proud of you,", "With love and pride,"],
    finale: "gift",
    defaultThemeId: "confetti-pop",
    suggestions: [
      "Congratulations, graduate! Your hard work paid off, and this is only the beginning. So proud of you!",
      "You dreamed it, you worked for it, you did it. The world is lucky to have you. Congratulations!",
      "Hats off to you! May your next chapter be even brighter than this one.",
    ],
    quiz: (s) => [
      { q: "Who always knew you'd make it? 🥰", options: [me(s), "Your alarm clock", "The canteen uncle"], answer: 0 },
      { q: "What got you through the exams? 🎓", options: ["Pure luck", "Your hard work", "Group chats"], answer: 1 },
    ],
  },
  {
    id: "new-baby",
    name: "New Baby",
    emoji: "👶",
    wish: "new baby wish",
    greeting: "Congratulations",
    surprise: "your baby surprise",
    tagline: "Welcome the little one.",
    recipientLabel: "The parents' names",
    recipientPlaceholder: "e.g. Ali & Sara",
    yaySub: "Ten tiny fingers, ten tiny toes and one very big reason to celebrate.",
    quizLabel: "Baby Quiz",
    signoff: ["With love,", "With love and prayers,"],
    finale: "gift",
    defaultThemeId: "balloon-party",
    suggestions: [
      "Congratulations on your little bundle of joy! Wishing your family health, happiness and plenty of sleep.",
      "Welcome to the world, little one. You are already so loved. Congratulations to the proud parents!",
      "A new baby, a new adventure. May your home be filled with giggles, cuddles and endless love.",
    ],
    quiz: (s) => [
      { q: "Who can't wait to meet the baby? 🥰", options: [me(s), "The postman", "Nobody"], answer: 0 },
      { q: "What will you get the least of now? 👶", options: ["Love", "Cuddles", "Sleep"], answer: 2 },
    ],
  },
  {
    id: "congratulations",
    name: "Congratulations",
    emoji: "🏆",
    wish: "congratulations wish",
    greeting: "Congratulations",
    surprise: "your surprise",
    tagline: "New job, new home, big win.",
    recipientLabel: "Their name",
    recipientPlaceholder: "e.g. Ayesha",
    yaySub: "You worked for this, you earned this — now it's time to celebrate it.",
    quizLabel: "Winner's Quiz",
    signoff: ["So proud of you,", "With love and pride,"],
    finale: "gift",
    defaultThemeId: "confetti-pop",
    suggestions: [
      "Congratulations! You worked so hard for this and deserve every bit of it. So proud of you!",
      "Big news deserves a big cheer. Well done — this is just the start of even greater things.",
      "I always knew you could do it. Congratulations on this amazing achievement!",
    ],
    quiz: (s) => [
      { q: "Who is your biggest fan? 🥰", options: [me(s), "Your boss", "Your phone"], answer: 0 },
      { q: "How did you get here? 🏆", options: ["Pure luck", "Hard work", "Magic"], answer: 1 },
    ],
  },
  {
    id: "get-well",
    name: "Get Well Soon",
    emoji: "🌻",
    wish: "get-well wish",
    greeting: "Get well soon",
    surprise: "a little pick-me-up",
    tagline: "A smile to speed up recovery.",
    recipientLabel: "Their name",
    recipientPlaceholder: "e.g. Ayesha",
    yaySub: "Sending you a big hug, lots of rest and all the good vibes in the world.",
    quizLabel: "Feel-Better Quiz",
    signoff: ["Thinking of you,", "With love and prayers,"],
    finale: "gift",
    defaultThemeId: "pastel-garden",
    suggestions: [
      "Get well soon! Sending you rest, strength and a big warm hug. We miss you already.",
      "Take all the time you need to heal. I'm thinking of you and praying for a speedy recovery.",
      "Things aren't the same without you. Rest up, feel better, and come back stronger!",
    ],
    quiz: (s) => [
      { q: "Who is thinking of you right now? 🥰", options: [me(s), "Your doctor", "Your pillow"], answer: 0 },
      { q: "What's the best medicine? 🌻", options: ["More soup", "Rest and love", "Scrolling all night"], answer: 1 },
    ],
  },
  {
    id: "thank-you",
    name: "Thank You",
    emoji: "🙏",
    wish: "thank-you note",
    greeting: "Thank you",
    surprise: "a little thank-you",
    tagline: "Say thanks in a way they'll keep.",
    recipientLabel: "Their name",
    recipientPlaceholder: "e.g. Ayesha, or Mama & Baba",
    yaySub: "For everything you've done, big and small — it meant more than you know.",
    quizLabel: "Thank-You Quiz",
    signoff: ["Gratefully yours,", "With love and thanks,"],
    finale: "gift",
    defaultThemeId: "pastel-garden",
    suggestions: [
      "Thank you for everything. Your kindness meant more to me than I can put into words.",
      "I'm so lucky to have you in my life. Thank you for always being there when it mattered.",
      "You went out of your way for me, and I'll never forget it. Thank you from the bottom of my heart.",
    ],
    quiz: (s) => [
      { q: "Who is really grateful for you? 🥰", options: [me(s), "Your cat", "The delivery guy"], answer: 0 },
      { q: "What do you always give? 🙏", options: ["Bad advice", "Your time and care", "Homework"], answer: 1 },
    ],
  },
  {
    id: "new-year",
    name: "New Year",
    emoji: "🎆",
    wish: "New Year wish",
    greeting: "Happy New Year",
    surprise: "your New Year surprise",
    tagline: "Start their year with a smile.",
    recipientLabel: "Their name",
    recipientPlaceholder: "e.g. Ayesha, or The Khan Family",
    yaySub: "A fresh year, a fresh start — and I'm so glad you're part of mine.",
    quizLabel: "New Year Quiz",
    signoff: ["With love,", "With love,"],
    finale: "gift",
    defaultThemeId: "midnight-gold",
    suggestions: [
      "Happy New Year! May the months ahead bring you health, happiness and everything you've been hoping for.",
      "New year, new adventures. Thank you for making the last one so special — here's to an even better one.",
      "Wishing you 12 months of success, 52 weeks of laughter and 365 days of happiness. Happy New Year!",
    ],
    quiz: (s) => [
      { q: "Who's cheering for you this year? 🥰", options: [me(s), "Your gym trainer", "Your alarm clock"], answer: 0 },
      { q: "What's the best resolution? 🎆", options: ["More worrying", "More time together", "More emails"], answer: 1 },
    ],
  },
];

export const DEFAULT_OCCASION_ID = OCCASIONS[0].id;

export function findOccasion(id: string | undefined): Occasion | undefined {
  return OCCASIONS.find((o) => o.id === id);
}

export function getOccasion(id: string | undefined): Occasion {
  return findOccasion(id) ?? OCCASIONS[0];
}
