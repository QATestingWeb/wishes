import Link from "next/link";
import { Logo } from "@/components/SiteChrome";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 text-center">
      <Logo />
      <p className="mt-10 text-6xl" aria-hidden>
        🎈
      </p>
      <h1 className="mt-4 font-display text-3xl font-semibold">Page not found</h1>
      <p className="mt-3 max-w-sm text-ink-soft">This page floated away. Let&apos;s make a surprise instead.</p>
      <Link href="/create" className="mt-8 rounded-full bg-coral px-7 py-3.5 font-semibold text-white hover:bg-coral-dark">
        Create a wish
      </Link>
    </main>
  );
}
