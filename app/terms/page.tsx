import type { Metadata } from "next";
import { ProsePage } from "@/components/SiteChrome";
import { SITE_NAME } from "@/lib/site";

export const metadata: Metadata = { title: "Terms of Use" };

export default function TermsPage() {
  return (
    <ProsePage title="Terms of Use" intro="Template — have this reviewed by your legal advisor before launch.">
      <section>
        <h2>Using {SITE_NAME}</h2>
        <p>
          {SITE_NAME} lets you create birthday greeting pages and share them by link. By using it, you agree to these
          terms.
        </p>
      </section>
      <section>
        <h2>Your content</h2>
        <ul>
          <li>Only upload photos you have the right to share, and that the people pictured would be happy to see shared.</li>
          <li>Don&apos;t upload anything illegal, hateful, sexual, violent or harassing.</li>
          <li>You keep ownership of your content. You give us permission to store and display it only to provide the service.</li>
        </ul>
      </section>
      <section>
        <h2>Removal</h2>
        <p>
          We may remove any wish that breaks these terms or is reported, without notice. Wishes are deleted
          automatically after the retention period.
        </p>
      </section>
      <section>
        <h2>No warranty</h2>
        <p>
          The service is provided &quot;as is&quot;. We do our best to keep it available, but can&apos;t guarantee a wish
          will always be reachable.
        </p>
      </section>
    </ProsePage>
  );
}
