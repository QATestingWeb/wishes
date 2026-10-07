import { NextResponse } from "next/server";
import { EVENT_TYPES, track, type EventType } from "@/lib/repo";
import { clientIp, rateLimit } from "@/lib/security";

export const runtime = "nodejs";

// Only client-side events may be posted here; server-side events are tracked directly.
const CLIENT_EVENTS = new Set<EventType>([
  "creator_started",
  "share_copy",
  "share_whatsapp",
  "share_native",
  "share_email",
]);

export async function POST(req: Request) {
  const ip = await clientIp();
  if (!rateLimit(`events:${ip}`, 60, 60_000).ok) return new NextResponse(null, { status: 204 });
  try {
    const { type } = (await req.json()) as { type?: string };
    if (type && (EVENT_TYPES as readonly string[]).includes(type) && CLIENT_EVENTS.has(type as EventType)) {
      await track(type as EventType);
    }
  } catch {}
  return new NextResponse(null, { status: 204 });
}
