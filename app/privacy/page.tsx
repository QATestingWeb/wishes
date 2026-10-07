import type { Metadata } from "next";
import { ProsePage } from "@/components/SiteChrome";

export const metadata: Metadata = { title: "Privacy" };

export default function PrivacyPage() {
  return (
    <ProsePage title="Privacy" intro="Short version: everything stays on your device.">
      <section>
        <h2>What happens to my photos and words?</h2>
        <p>
          Nothing leaves your browser. Names, your letter, quiz and photos are kept in this browser tab only. Photos
          are resized on your device and are never uploaded to a server.
        </p>
      </section>
      <section>
        <h2>How long is it kept?</h2>
        <p>Until you close the tab. Refreshing keeps it; closing the tab clears it.</p>
      </section>
      <section>
        <h2>Accounts, cookies and tracking</h2>
        <p>There are no accounts, no tracking cookies and no analytics.</p>
      </section>
    </ProsePage>
  );
}
