import Link from "next/link";
import { SITE_NAME } from "@/lib/site";

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2 font-display text-xl font-semibold tracking-tight">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/icon.svg" alt="" className="h-8 w-8" />
      {SITE_NAME}
    </Link>
  );
}

export function SiteHeader({ cta = true }: { cta?: boolean }) {
  return (
    <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
      <Logo />
      <nav className="flex items-center gap-1 text-sm font-medium sm:gap-3">
        <Link href="/help" className="rounded-full px-3 py-2 text-ink-soft hover:text-ink">
          Help
        </Link>
        {cta && (
          <Link
            href="/create"
            className="rounded-full bg-ink px-4 py-2 text-cream transition hover:bg-coral"
          >
            Create a wish
          </Link>
        )}
      </nav>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-line">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-5 py-8 text-sm text-ink-soft sm:flex-row sm:items-center sm:justify-between">
        <p>
          © {new Date().getFullYear()} {SITE_NAME}. Made for celebrating the people you love.
        </p>
        <nav className="flex gap-5">
          <Link href="/help" className="hover:text-ink">Help</Link>
          <Link href="/privacy" className="hover:text-ink">Privacy</Link>
          <Link href="/terms" className="hover:text-ink">Terms</Link>
        </nav>
      </div>
    </footer>
  );
}

export function ProsePage({ title, intro, children }: { title: string; intro?: string; children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-5 pt-8 pb-20">
        <h1 className="font-display text-4xl font-semibold sm:text-5xl">{title}</h1>
        {intro && <p className="mt-4 text-lg text-ink-soft">{intro}</p>}
        <div className="mt-10 space-y-8 leading-relaxed [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_li]:ml-5 [&_li]:list-disc [&_p]:text-ink-soft [&_ul]:space-y-2 [&_ul]:text-ink-soft">
          {children}
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
