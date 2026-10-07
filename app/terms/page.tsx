import type { Metadata } from "next";
import { ProsePage } from "@/components/SiteChrome";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Use" intro="Template — have this reviewed before launch.">
      <section>
        <h2>Using {SITE_NAME}</h2>
        <p>{SITE_NAME} lets you build a personal surprise for any occasion in your browser. By using it, you agree to these terms.</p>
      </section>
      <section>
        <h2>Your content</h2>
        <ul>
          <li>Only use photos you have the right to use, and that the people pictured would be happy to see.</li>
          <li>Don&apos;t create anything illegal, hateful, sexual, violent or harassing.</li>
          <li>Your content stays on your device and remains yours.</li>
        </ul>
      </section>
      <section>
        <h2>No warranty</h2>
        <p>The service is provided &quot;as is&quot;, without guarantees.</p>
      </section>
    </ProsePage>
  );
}
