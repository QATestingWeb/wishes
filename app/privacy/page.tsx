import type { Metadata } from "next";
import { ProsePage } from "@/components/SiteChrome";
import { SITE_NAME, retentionDays } from "@/lib/site";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  const days = retentionDays();
  return (
    <ProsePage title="Privacy Policy" intro="Template — have this reviewed by your legal advisor before launch.">
      <section>
        <h2>What we collect</h2>
        <p>
          When you create a birthday wish, we store the names you enter, your message, the photos you upload and the
          design you chose. We don&apos;t ask for an account, email address or phone number.
        </p>
      </section>
      <section>
        <h2>How photos are handled</h2>
        <ul>
          <li>Photos are resized and converted on upload. Hidden metadata — including GPS location — is removed.</li>
          <li>Photos are stored on secure servers and only served as part of your wish page.</li>
          <li>Photos uploaded but never used in a wish are deleted within 24 hours.</li>
        </ul>
      </section>
      <section>
        <h2>Who can see a wish</h2>
        <p>
          Anyone with the link. Links contain a long random code so they can&apos;t be guessed, and wish pages are
          excluded from search engines. Please only share the link with people you trust.
        </p>
      </section>
      <section>
        <h2>How long we keep it</h2>
        <p>
          Each wish and its photos are deleted automatically {days} days after creation. You can ask us to delete one
          sooner by contacting us with its link.
        </p>
      </section>
      <section>
        <h2>Analytics</h2>
        <p>
          We count anonymous events (such as &quot;a wish was created&quot; or &quot;a link was copied&quot;) to improve{" "}
          {SITE_NAME}. These counts aren&apos;t linked to you, and we don&apos;t use advertising trackers. IP addresses
          are used briefly in memory to prevent abuse and are not stored.
        </p>
      </section>
      <section>
        <h2>Contact</h2>
        <p>Questions or deletion requests: [your contact email].</p>
      </section>
    </ProsePage>
  );
}
