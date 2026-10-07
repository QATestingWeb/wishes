import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { ThemeThumb } from "@/components/ThemeThumb";
import { WishCard } from "@/components/WishCard";
import { getActiveThemes, getFaqs } from "@/lib/repo";
import { retentionDays } from "@/lib/site";

export const dynamic = "force-dynamic";

const STEPS = [
  { n: "1", title: "Add names & photos", body: "Who's the birthday star, who's it from, and a favourite picture or four." },
  { n: "2", title: "Write your message", body: "Say it in your own words, or start from one of our suggestions." },
  { n: "3", title: "Pick a design & share", body: "Choose a theme, preview it, and send the link on WhatsApp or anywhere." },
];

function CreateButton({ className = "" }: { className?: string }) {
  return (
    <Link
      href="/create"
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-coral px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-coral/25 transition hover:bg-coral-dark active:scale-[0.98] ${className}`}
    >
      Create a Birthday Wish
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M11.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4l3.3-3.3H3a1 1 0 1 1 0-2h11.6l-3.3-3.3a1 1 0 0 1 0-1.4z" />
      </svg>
    </Link>
  );
}

export default async function Home() {
  const [themes, faqs] = await Promise.all([getActiveThemes(), getFaqs()]);
  const hero = themes[0];

  return (
    <>
      <SiteHeader />
      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pt-6 pb-16 md:grid-cols-[1.1fr_1fr] md:pt-12 md:pb-24">
          <div>
            <p className="inline-flex rounded-full bg-coral-soft px-3 py-1 text-sm font-medium text-coral-dark">
              Free · No sign-up · Ready in a minute
            </p>
            <h1 className="mt-5 font-display text-5xl leading-[1.05] font-semibold tracking-tight sm:text-6xl">
              Make their birthday feel <span className="text-coral italic">personal.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Add their name, your favourite photos and a heartfelt message. We&apos;ll turn it into a beautiful birthday
              page you can share with a single link.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CreateButton />
              <a href="#how" className="px-4 py-3 text-center font-medium text-ink-soft hover:text-ink">
                See how it works
              </a>
            </div>
          </div>

          {hero && (
            <div className="relative mx-auto w-full max-w-[340px]">
              <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-sun/30 via-coral-soft to-teal/20 blur-2xl" />
              <div className="overflow-hidden rounded-[2.4rem] border-[10px] border-ink bg-ink shadow-2xl">
                <div className="h-[560px] overflow-hidden rounded-[1.7rem]">
                  <WishCard
                    theme={hero}
                    recipientName="Ayesha"
                    senderName="Sara"
                    message={"Happy birthday to my favourite person! Here's to another year of adventures, late-night chai and endless laughs."}
                    photos={["/sample-cake.svg"]}
                    animated
                  />
                </div>
              </div>
            </div>
          )}
        </section>

        {/* How it works */}
        <section id="how" className="scroll-mt-8 border-y border-line bg-sand/60">
          <div className="mx-auto max-w-6xl px-5 py-16 md:py-20">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Three steps. That&apos;s it.</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {STEPS.map((s) => (
                <div key={s.n} className="rounded-3xl bg-cream p-6 shadow-sm">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-ink font-display text-lg text-cream">
                    {s.n}
                  </div>
                  <h3 className="mt-4 text-xl font-semibold">{s.title}</h3>
                  <p className="mt-2 text-ink-soft">{s.body}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Themes */}
        <section className="mx-auto max-w-6xl px-5 py-16 md:py-20">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">Designs for every kind of birthday</h2>
              <p className="mt-2 text-ink-soft">From playful to elegant — switch anytime while you create.</p>
            </div>
          </div>
          <div className="-mx-5 mt-10 flex snap-x gap-5 overflow-x-auto px-5 pb-4">
            {themes.map((t) => (
              <Link
                key={t.id}
                href={`/create?theme=${t.id}`}
                className="group shrink-0 snap-start overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <ThemeThumb theme={t} />
                <div className="border-t border-line p-4">
                  <p className="font-semibold">{t.name}</p>
                  <p className="mt-0.5 max-w-[150px] text-sm text-ink-soft">{t.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>

        {/* Trust + FAQ */}
        <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-20">
          <div className="grid gap-10 md:grid-cols-[1fr_1.4fr]">
            <div className="rounded-3xl bg-ink p-8 text-cream">
              <h2 className="font-display text-2xl font-semibold">Private by design</h2>
              <ul className="mt-5 space-y-3 text-cream/80">
                <li>• Only people with the link can open a wish.</li>
                <li>• Wish pages never appear in search engines.</li>
                <li>• Photo location data is removed on upload.</li>
                <li>• Everything is deleted after {retentionDays()} days.</li>
              </ul>
            </div>
            <div>
              <h2 className="font-display text-2xl font-semibold">Questions</h2>
              <div className="mt-4 divide-y divide-line">
                {faqs.slice(0, 4).map((f) => (
                  <details key={f.q} className="group py-4">
                    <summary className="flex cursor-pointer list-none items-center justify-between font-medium">
                      {f.q}
                      <span className="text-xl text-ink-soft transition group-open:rotate-45">+</span>
                    </summary>
                    <p className="mt-2 text-ink-soft">{f.a}</p>
                  </details>
                ))}
              </div>
              <Link href="/help" className="mt-4 inline-block font-medium text-coral hover:underline">
                More help →
              </Link>
            </div>
          </div>
        </section>

        <section className="px-5 pb-20">
          <div className="mx-auto max-w-4xl rounded-[2.5rem] bg-coral-soft px-6 py-14 text-center">
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">Someone&apos;s birthday coming up?</h2>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">Make it in a minute. They&apos;ll remember it for much longer.</p>
            <CreateButton className="mt-8" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
