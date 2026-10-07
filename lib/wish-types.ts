/** Types shared by server and client code. */

export interface QuizItem {
  q: string;
  options: string[]; // exactly 3
  answer: number; // index of the correct option
}

export type Screen = "ask" | "yay" | "hub" | "letter" | "photos" | "quiz" | "finale";
