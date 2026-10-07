import Link from "next/link";
import { Logo } from "./SiteChrome";

const COPY = {
  missing: {
    title: "We couldn't find this wish",
    body: "The link may be mistyped — try copying it again from the message you received.",
  },
  expired: {
    title: "This wish has expired",
    body: "To protect everyone's privacy, birthday wishes and their photos are deleted automatically after a while.",
  },
  hidden: {
    title: "This wish isn't available",
    body: "It has been reported and is waiting for review.",
  },
} as const;

export function WishUnavailable({ status }: { status: keyof typeof COPY }) {
  const c = COPY[status];
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <div className="mt-10 text-6xl" aria-hidden>
        🎈
      </div>
      <h1 className="mt-4 font-display text-3xl font-semibold">{c.title}</h1>
      <p className="mt-3 max-w-sm text-ink-soft">{c.body}</p>
      <Link href="/create" className="mt-8 rounded-full bg-coral px-7 py-3.5 font-semibold text-white hover:bg-coral-dark">
        Create a birthday wish
      </Link>
    </main>
  );
}
