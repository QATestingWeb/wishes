# Wishful — Personalized Birthday Wishes

A mobile-first Next.js app where anyone can create a personal birthday page — names, photos, a message and a
theme — and share it with one link. Built to the MVP definition in the project proposal.

## Quick start

```bash
cp .env.example .env.local   # set ADMIN_PASSWORD etc.
npm install
npm run dev                  # http://localhost:3000
```

Production: `npm run build && npm start`, or `docker build -t wishful . && docker run -p 3000:3000 -v wishful-data:/data --env-file .env.local wishful`.

## Stack

| Layer | Choice | Why |
| --- | --- | --- |
| Framework | **Next.js 16** (App Router, React 19, Server Components, Server Actions) | One codebase for pages, API and admin; fast SSR for share previews |
| Language | TypeScript (strict) | Maintainability |
| Styling | Tailwind CSS v4 with container queries | The same wish component scales from thumbnail to full screen |
| Images | **sharp** | Resize to 1600px, WebP, EXIF-orientation fix, metadata/GPS stripped |
| Validation | zod | One schema for every wish submission |
| IDs | nanoid | Unguessable share links (`/w/ayesha-k7m2p9xq4r`) |

## What's built

- **Landing page** — hero with live animated sample, how-it-works, theme gallery, privacy points, FAQ.
- **Creator wizard** (`/create`) — 5 steps (Names → Photos → Message → Design → Preview) with progress bar, live phone
  preview on desktop and a preview sheet on mobile, sticky thumb-friendly action bar, inline validation in plain
  language, draft saved across refreshes.
- **Photo upload** — up to 4 photos, client-side downscaling before upload (fast on mobile data), preview, replace,
  remove, "make main", server-side byte inspection (file names / MIME types aren't trusted), 10 MB limit.
- **5 themes** — Confetti Pop, Midnight Gold, Pastel Garden, Balloon Party, Simply Elegant.
- **Wish page** (`/w/[slug]`) — "tap to open" envelope reveal, animated entrance and decorations (respects
  reduced-motion), Open Graph tags so WhatsApp/iMessage show the photo and name, report button.
- **Share page** (`/w/[slug]/share`) — copy link, WhatsApp, native share sheet / email, expiry date.
- **Admin** (`/admin`, password-protected) — usage stats and 14-day chart, sharing breakdown, wish moderation
  (reported first, approve / delete), template activate / reorder / describe, FAQ editor.
- **Help, Privacy, Terms** pages (legal pages are templates — have them reviewed).

## Architecture

```
app/
  page.tsx                 landing
  create/                  wizard (server page → <Creator/> client component)
  w/[slug]/                recipient page + share page
  admin/                   dashboard + server actions
  api/upload               POST photo → sharp → blob store
  api/photos/[id]          GET optimized photo
  api/wishes               POST create wish
  api/wishes/[slug]/report POST report
  api/events               POST anonymous analytics event
  api/cron/cleanup         GET (bearer) delete expired wishes + orphan photos
components/WishCard.tsx    the single source of truth for how a wish looks
lib/themes.ts              theme registry (visual definitions)
lib/storage.ts             BlobStore + JsonStore interfaces, local-disk drivers
lib/repo.ts                wishes, templates, FAQs, stats, cleanup
lib/security.ts            rate limiting, admin session
```

**Storage is behind two small interfaces** (`BlobStore`, `JsonStore`). The MVP uses local disk so it runs on any
VPS or container with a volume. For multi-instance or serverless hosting, replace the drivers in `lib/storage.ts` with
S3/Cloudflare R2 (photos) and Postgres (records) — no page or API code changes.

## Answers to the proposal's questions

1. **Stack** — above. Next.js gives SEO-friendly SSR, link previews and API routes in one maintainable codebase.
2. **Image storage & optimization** — every upload is decoded by sharp (rejecting anything that isn't a real image),
   auto-rotated, resized to ≤1600px, re-encoded as WebP (~80–300 KB), and stripped of EXIF/GPS. Stored under a random
   24-char ID. Move to private R2/S3 + CDN for production.
3. **Unique URLs** — `{recipient-name}-{10 random chars}` from a 31-char alphabet (~10¹⁵ combinations per name),
   so links are friendly but unguessable. Wish pages are `noindex` and blocked in robots.txt.
4. **Templates** — each theme is a typed object in `lib/themes.ts` (palette, fonts, photo frame style, decoration)
   rendered by one `WishCard` component. Adding a theme = one object + deploy; admins then activate/order it.
5. **Hosting & costs** — small VPS or container host (≈ $5–25/month) is enough for the MVP. With R2 for photos,
   storage is ≈ $0.015/GB-month and egress is free. No email/SMS services are required.
6. **Abuse protection** — per-IP rate limits on uploads, creation, reports and admin login; byte-level file
   validation and re-encoding (malicious payloads don't survive); size and pixel-count limits; length limits and
   control-character stripping on text; React output escaping; report button with auto-hide after 3 reports;
   security headers (HSTS, nosniff, frame-deny). Add Cloudflare Turnstile and image moderation (e.g. AWS Rekognition)
   if abuse appears.
7. **Retention** — default 30 days (`WISH_RETENTION_DAYS`). Expired wishes show a friendly page immediately; schedule
   `GET /api/cron/cleanup` daily to delete them and unused uploads.

## Environment variables

See `.env.example`. Set `NEXT_PUBLIC_SITE_URL` to your real domain so share links and previews are correct.

## Scheduled cleanup

```bash
# daily, e.g. crontab or your host's scheduler
curl -H "Authorization: Bearer $CRON_SECRET" https://your-domain/api/cron/cleanup
```

## Next steps (from proposal §9)

Downloadable card image (render `WishCard` with `next/og`), AI message suggestions, custom slugs, music, accounts,
premium templates. The theme registry and storage interfaces were designed with these in mind.
