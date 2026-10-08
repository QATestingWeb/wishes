import type { Metadata } from "next";
import { ProsePage } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy" intro="Short version: everything stays on your device until you ask for a link.">
      <section>
        <h2>What happens to my photos and words?</h2>
        <p>
          While you build a wish, nothing leaves your browser. Names, your letter, quiz and photos are kept in this
          browser tab only, and photos are resized on your device.
        </p>
      </section>
      <section>
        <h2>What happens when I get a link?</h2>
        <p>
          Tapping <strong>Get my link</strong> uploads that wish — the names, letter, quiz and photos — to our storage
          provider (Vercel Blob) so the person you send it to can open it. Anyone who has the link can see it. Links
          are long and random, and shared wishes are hidden from search engines.
        </p>
      </section>
      <section>
        <h2>How long is it kept?</h2>
        <p>
          A draft lasts until you close the tab. A shared wish stays available at its link until it is removed — contact
          us with the link if you&apos;d like yours deleted.
        </p>
      </section>
      <section>
        <h2>Accounts, cookies and tracking</h2>
        <p>There are no accounts, no tracking cookies and no analytics.</p>
      </section>
    </ProsePage>
  );
}
