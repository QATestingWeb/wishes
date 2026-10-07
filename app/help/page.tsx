import type { Metadata } from "next";
import Link from "next/link";
import { ProsePage } from "@/components/SiteChrome";
import { getFaqs } from "@/lib/repo";

export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Help & FAQ",
  description: "How to create and share a personalized birthday wish, and answers to common questions.",
};

export default async function HelpPage() {
  const faqs = await getFaqs();
  return (
    <ProsePage title="Help & FAQ" intro="Everything you need to know about making a birthday wish.">
      <section>
        <h2>How it works</h2>
        <ul className="mt-3">
          <li>Tap <strong>Create a Birthday Wish</strong>.</li>
          <li>Enter the birthday person&apos;s name and your name.</li>
          <li>Add one to four photos.</li>
          <li>Write a message, or pick one of our suggestions.</li>
          <li>Choose a design, check the preview, and create your page.</li>
          <li>Share the link — WhatsApp, email, or wherever you like.</li>
        </ul>
      </section>
      <section>
        <h2>Common questions</h2>
        <div className="mt-3 divide-y divide-line">
          {faqs.map((f) => (
            <div key={f.q} className="py-4">
              <h3 className="font-semibold text-ink">{f.q}</h3>
              <p className="mt-1">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
      <Link href="/create" className="inline-block rounded-full bg-coral px-7 py-3.5 font-semibold text-white hover:bg-coral-dark">
        Create a birthday wish
      </Link>
    </ProsePage>
  );
}
