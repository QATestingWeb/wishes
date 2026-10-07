import { z } from "zod";
import { LIMITS } from "./site";

// Strip control characters and collapse runs of whitespace.
const cleanLine = (s: string) => s.replace(/[\u0000-\u001f\u007f]/g, "").replace(/\s+/g, " ").trim();
const cleanText = (s: string) =>
  s
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0009\u000b-\u001f\u007f]/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const name = (label: string) =>
  z
    .string()
    .transform(cleanLine)
    .pipe(
      z
        .string()
        .min(1, `Please enter ${label}.`)
        .max(LIMITS.maxNameLength, `${label[0].toUpperCase()}${label.slice(1)} is too long (max ${LIMITS.maxNameLength} characters).`),
    );

export const wishSchema = z.object({
  recipientName: name("the birthday person's name"),
  senderName: name("your name"),
  message: z
    .string()
    .transform(cleanText)
    .pipe(
      z
        .string()
        .min(1, "Please write a birthday message.")
        .max(LIMITS.maxMessageLength, `Your message is too long (max ${LIMITS.maxMessageLength} characters).`),
    ),
  photoIds: z
    .array(z.string().regex(/^[A-Za-z0-9_-]{16,40}$/, "Invalid photo."))
    .min(1, "Please add at least one photo.")
    .max(LIMITS.maxPhotos, `You can add up to ${LIMITS.maxPhotos} photos.`),
  captions: z
    .array(z.string().transform(cleanLine).pipe(z.string().max(30, "Photo captions can be up to 30 characters.")))
    .max(LIMITS.maxPhotos)
    .default([]),
  quiz: z
    .array(
      z.object({
        q: z.string().transform(cleanLine).pipe(z.string().min(1, "Every quiz question needs some text.").max(120, "Quiz questions can be up to 120 characters.")),
        options: z
          .array(z.string().transform(cleanLine).pipe(z.string().min(1, "Please fill in all three answers for each quiz question.").max(40, "Quiz answers can be up to 40 characters.")))
          .length(3),
        answer: z.number().int().min(0).max(2),
      }),
    )
    .max(LIMITS.maxQuiz, `You can add up to ${LIMITS.maxQuiz} quiz questions.`)
    .default([]),
  themeId: z.string().min(1, "Please choose a design."),
});

export type WishInput = z.infer<typeof wishSchema>;
