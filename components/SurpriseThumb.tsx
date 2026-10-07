import { DEFAULT_OCCASION_ID } from "@/lib/occasions";
import type { Theme } from "@/lib/themes";
import { Surprise } from "./Surprise";

/** A scaled-down, non-interactive rendering of the opening screen in a given theme. */
export function SurpriseThumb({
  theme,
  occasionId = DEFAULT_OCCASION_ID,
  recipientName = "Ayesha",
  senderName = "Sara",
  scale = 0.42,
  height = 300,
  inner = 390,
}: {
  theme: Theme;
  occasionId?: string;
  recipientName?: string;
  senderName?: string;
  scale?: number;
  height?: number;
  inner?: number;
}) {
  return (
    <div className="pointer-events-none relative overflow-hidden select-none" style={{ height, width: inner * scale }} aria-hidden>
      <div style={{ width: inner, height: height / scale, transform: `scale(${scale})`, transformOrigin: "top left" }}>
        <Surprise
          mode="thumb"
          theme={theme}
          occasionId={occasionId}
          recipientName={recipientName}
          senderName={senderName}
          message=""
          photos={[]}
          className="h-full"
        />
      </div>
    </div>
  );
}
