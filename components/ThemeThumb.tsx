import type { Theme } from "@/lib/themes";
import { WishCard } from "./WishCard";

/** A scaled-down, non-interactive rendering of a full wish in a given theme. */
export function ThemeThumb({
  theme,
  recipientName = "Ayesha",
  senderName = "Sara",
  message = "Wishing you a year full of laughter and adventure!",
  photos = ["/sample-cake.svg"],
  scale = 0.42,
  height = 300,
}: {
  theme: Theme;
  recipientName?: string;
  senderName?: string;
  message?: string;
  photos?: string[];
  scale?: number;
  height?: number;
}) {
  const inner = 390;
  return (
    <div className="relative overflow-hidden" style={{ height, width: inner * scale }} aria-hidden>
      <div style={{ width: inner, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <WishCard
          theme={theme}
          recipientName={recipientName}
          senderName={senderName}
          message={message}
          photos={photos}
        />
      </div>
    </div>
  );
}
