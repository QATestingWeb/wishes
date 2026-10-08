import Link from "next/link";
import { SiteFooter, SiteHeader } from "@/components/SiteChrome";
import { Surprise } from "@/components/Surprise";
import { SurpriseThumb } from "@/components/SurpriseThumb";
import { OCCASIONS, getOccasion, type Occasion } from "@/lib/occasions";
import { FAQS } from "@/lib/site";
import { THEMES, getTheme } from "@/lib/themes";

const STEPS = [
  { n: "1", title: "Pick an occasion & add photos", body: "Say who it's for, who it's from, and add a favourite picture or four." },
  { n: "2", title: "Write a letter & a quiz", body: "Your message becomes a handwritten letter. Add a cheeky quiz if you like." },
  { n: "3", title: "Pick a design & play", body: "Watch the full surprise: a YES they can't refuse, gifts to open and a finale made for the occasion." },
];

function CreateButton({ occasion, className = "" }: { occasion?: Occasion; className?: string }) {
  return (
    <Link
      href={occasion ? `/create?occasion=${occasion.id}` : "/create"}
      className={`inline-flex items-center justify-center gap-2 rounded-full bg-coral px-8 py-4 text-lg font-semibold text-white shadow-lg shadow-coral/25 transition hover:bg-coral-dark active:scale-[0.98] ${className}`}
    >
      {occasion ? `Create your ${occasion.wish}` : "Create a Wish"}
      <svg viewBox="0 0 20 20" className="h-5 w-5" fill="currentColor" aria-hidden>
        <path d="M11.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 1 1-1.4-1.4l3.3-3.3H3a1 1 0 1 1 0-2h11.6l-3.3-3.3a1 1 0 0 1 0-1.4z" />
      </svg>
    </Link>
  );
}

/** The home page, or — when an occasion is given — that occasion's own landing page. */
export function Landing({ occasion }: { occasion?: Occasion }) {
  const themes = THEMES;
  const faqs = FAQS;
  const demo = occasion ?? getOccasion(undefined);
  const hero = getTheme(demo.defaultThemeId);
  const createHref = (themeId: string) =>
    occasion ? `/create?occasion=${occasion.id}&theme=${themeId}` : `/create?theme=${themeId}`;

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
              {occasion ? `${occasion.name} wishes that feel ` : "Make every occasion feel "}
              <span className="text-coral italic">personal.</span>
            </h1>
            <p className="mt-5 max-w-lg text-lg text-ink-soft">
              Not just a card — a little interactive surprise. They tap through a question they can&apos;t say no to,
              open your gifts, read your letter, and finish with a little magic.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <CreateButton occasion={occasion} />
              <a href="#how" className="px-4 py-3 text-center font-medium text-ink-soft hover:text-ink">
                See how it works
              </a>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[340px]">
            <div className="absolute -inset-6 -z-10 rounded-[3rem] bg-gradient-to-br from-sun/30 via-coral-soft to-teal/20 blur-2xl" />
            <p className="mb-3 text-center text-sm font-medium text-ink-soft">👇 Try it — it&apos;s interactive</p>
            <div className="overflow-hidden rounded-[2.4rem] border-[10px] border-ink bg-ink shadow-2xl">
              <div className="h-[600px] overflow-y-auto rounded-[1.7rem]">
                <Surprise
                  mode="demo"
                  theme={hero}
                  occasionId={demo.id}
                  recipientName="Ayesha"
                  senderName="Sara"
                  message={demo.suggestions[0]}
                  photos={["/sample-cake.svg"]}
                  captions={["A favourite memory 📸"]}
                  quiz={demo.quiz("Sara")}
                  className="min-h-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* Occasions */}
        <section className="mx-auto max-w-6xl px-5 pb-16 md:pb-20">
          <h2 className="font-display text-3xl font-semibold sm:text-4xl">
            {occasion ? "More occasions" : "A wish for every occasion"}
          </h2>
          <div className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {OCCASIONS.filter((o) => o.id !== occasion?.id).map((o) => (
              <Link
                key={o.id}
                href={`/wishes/${o.id}`}
                className="rounded-3xl border border-line bg-white p-5 shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <span className="text-3xl" aria-hidden>
                  {o.emoji}
                </span>
                <p className="mt-3 font-semibold">{o.name}</p>
                <p className="mt-0.5 text-sm text-ink-soft">{o.tagline}</p>
              </Link>
            ))}
          </div>
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
              <h2 className="font-display text-3xl font-semibold sm:text-4xl">
                {occasion ? `Designs for your ${occasion.wish}` : "Designs for every occasion"}
              </h2>
              <p className="mt-2 text-ink-soft">Every design runs the same playful surprise — pick the look that fits them.</p>
            </div>
          </div>
          <div className="-mx-5 mt-10 flex snap-x gap-5 overflow-x-auto px-5 pb-4">
            {themes.map((t) => (
              <Link
                key={t.id}
                href={createHref(t.id)}
                className="group shrink-0 snap-start overflow-hidden rounded-3xl border border-line bg-white shadow-sm transition hover:-translate-y-1 hover:shadow-lg"
              >
                <SurpriseThumb theme={t} occasionId={demo.id} />
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
                <li>• No account, no sign-up.</li>
                <li>• Photos stay on your device while you build.</li>
                <li>• Nothing is uploaded until you ask for a link.</li>
                <li>• Only people with your link can open it.</li>
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
            <h2 className="font-display text-3xl font-semibold sm:text-4xl">
              {occasion ? `Ready to make your ${occasion.wish}?` : "Someone to celebrate?"}
            </h2>
            <p className="mx-auto mt-3 max-w-md text-ink-soft">Make it in a minute. They&apos;ll remember it for much longer.</p>
            <CreateButton occasion={occasion} className="mt-8" />
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
