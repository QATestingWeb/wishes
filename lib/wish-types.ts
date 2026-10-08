/** Types shared by server and client code. */

export interface QuizItem {
  q: string;
  options: string[]; // exactly 3
  answer: number; // index of the correct option
}

/** A wish stored for sharing — what /w/<slug> plays. */
export interface SharedWish {
  occasionId: string;
  themeId: string;
  recipientName: string;
  senderName: string;
  message: string;
  photos: { url: string; caption: string }[];
  quiz: QuizItem[];
  createdAt: string;
}

export type Screen= "ask" | "yay" | "hub" | "letter" | "photos" | "quiz" | "finale";
