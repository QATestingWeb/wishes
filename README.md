# Wishful — Wishes for every occasion

A Next.js app that builds an interactive surprise for any occasion (birthday, anniversary, wedding, Eid,
graduation, new baby, get well soon, thank you and more) in the browser, then turns it into a link to send.
The wizard and preview run entirely on the visitor's device; only **“Get my link”** talks to the server, which
stores the wish and its photos in [Vercel Blob](https://vercel.com/docs/vercel-blob). There is no database.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production: `npm run build && npm start` (or `docker build -t wishful . && docker run -p 3000:3000 wishful`).

### Turning on share links

Share links need a Vercel Blob store. One-time setup:

1. Vercel dashboard → your project → **Storage** → **Create Database** → **Blob**, with **Public** access, and
   connect it to the project. This adds `BLOB_READ_WRITE_TOKEN` to the project's environment variables.
2. Redeploy.
3. For local development, copy the token into `.env.local` (see `.env.example`), or run `vercel env pull .env.local`.

Without the token everything else works; “Get my link” answers *“Sharing isn't set up on this site yet.”*

## How it works

1. **`/create`** — 7-step wizard: Occasion → Names → Photos → Letter → Quiz → Design → Preview, with a live
   interactive preview. `/create?occasion=eid` skips the occasion step.
   Each occasion also has its own landing page at **`/wishes/<occasion>`** (listed in the sitemap).
2. Tap **“Preview”** on the last step → **`/preview`** plays the full-screen surprise:
   - *"Ayesha, are you ready for your birthday surprise? 🥺"* — every **No** grows the **Yes** button.
   - The occasion's greeting + confetti → gift screen (Letter · Memories · Quiz) → *Finally…*
   - Finale: blow out the candles (birthday, anniversary) or open one last gift (everything else) → main photo
     and sign-off.
   - "✏️ Edit or share" at the end (or "← Edit or share" at the top) goes back to the wizard with everything filled in.
3. Tap **“Get my link 🔗”** on the last step → the photos and the wish are uploaded and the wizard shows the link
   with Copy, WhatsApp and share buttons. The link is **`/w/<slug>`**, which plays the same surprise for the
   recipient and ends with "Make your own".

### Where the data lives

- Photos are resized to ≤1400px JPEG **on the device** (`lib/draft.ts`) and kept as data URLs.
- The draft is saved in `sessionStorage`, so a refresh keeps it and closing the tab clears it.
- A shared wish is `wishes/<slug>.json` plus `photos/<id>.jpg` in the Blob store (`lib/share.ts`). Slugs are 12
  random characters; `/w/` pages are `noindex`. Asking for a link twice without changes reuses the first link.
- Links work for `LIMITS.shareDays` (30) days. A daily Vercel Cron job (`vercel.json` → `/api/cron/cleanup`)
  deletes older wishes and photos; it only runs when the `CRON_SECRET` environment variable is set (any long
  random string). To remove one wish sooner, delete its files in the Vercel Blob dashboard.
- The upload routes validate everything and have a small per-instance rate limit. For real traffic put a shared
  limiter (e.g. Upstash) or Vercel's firewall rules in front of `/api/*`.

## Project structure

```
app/
  page.tsx            home → components/Landing.tsx
  wishes/[occasion]/  one landing page per occasion → components/Landing.tsx
  create/page.tsx     wizard page → components/Creator.tsx
  preview/            full-screen surprise, reads the draft from the browser
  w/[slug]/           a shared wish — what the recipient opens
  api/photos, wishes  the two upload routes behind “Get my link”
  api/cron/cleanup    daily job that deletes expired wishes
  help, privacy, terms
components/
  Landing.tsx         landing page (with a live demo of the surprise)
  Surprise.tsx        the interactive surprise (full screen, demo, side preview, thumbnails)
  Sticker.tsx         original SVG bear sticker with moods
  Creator.tsx         the wizard
  SharePanel.tsx      the link with Copy / WhatsApp / share buttons
  Decorations.tsx     petals / confetti / stars / balloons backgrounds
lib/
  occasions.ts        every occasion: wording, starter letters, starter quiz, finale, default design
  themes.ts           6 designs (Sweet Pink is the default)
  draft.ts            browser storage + on-device photo resizing
  share.ts            server: validation and Vercel Blob storage for shared wishes
  share-client.ts     browser: uploads a draft and returns its link
  site.ts             name, limits, FAQs
```

## Customising

- **Brand name:** `SITE_NAME` in `lib/site.ts`.
- **New occasion:** add an object to `OCCASIONS` in `lib/occasions.ts` — its page, wizard option and sitemap
  entry appear automatically.
- **New design:** add an object to `THEMES` in `lib/themes.ts`.
- **Texts on the surprise screens:** per-occasion words in `lib/occasions.ts`; shared ones in `NO_STEPS`,
  `FINALE_COPY` and the screen blocks in `components/Surprise.tsx`.
