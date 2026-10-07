# Wishful — Wishes for every occasion (frontend only)

A Next.js app that builds an interactive surprise for any occasion (birthday, anniversary, wedding, Eid,
graduation, new baby, get well soon, thank you and more) entirely in the browser.
There is **no backend, no API routes and no database** — Next.js serves the pages and everything else runs on the
visitor's device.

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

Production: `npm run build && npm start` (or `docker build -t wishful . && docker run -p 3000:3000 wishful`).

## How it works

1. **`/create`** — 7-step wizard: Occasion → Names → Photos → Letter → Quiz → Design → Preview, with a live
   interactive preview. `/create?occasion=eid` skips the occasion step.
   Each occasion also has its own landing page at **`/wishes/<occasion>`** (listed in the sitemap).
2. Tap **“See my surprise 🎉”** on the last step → **`/preview`** plays the full-screen surprise:
   - *"Ayesha, are you ready for your birthday surprise? 🥺"* — every **No** grows the **Yes** button.
   - The occasion's greeting + confetti → gift screen (Letter · Memories · Quiz) → *Finally…*
   - Finale: blow out the candles (birthday, anniversary) or open one last gift (everything else) → main photo
     and sign-off.
   - "✏️ Edit my wish" at the end (or "← Edit" at the top) goes back to the wizard with everything filled in.

### Where the data lives

- Photos are resized to ≤1400px JPEG **on the device** (`lib/draft.ts`) and kept as data URLs — never uploaded.
- The whole wish is saved in `sessionStorage`, so a refresh keeps it and closing the tab clears it.

## Project structure

```
app/
  page.tsx            home → components/Landing.tsx
  wishes/[occasion]/  one landing page per occasion → components/Landing.tsx
  create/page.tsx     wizard page → components/Creator.tsx
  preview/            full-screen surprise, reads the draft from the browser
  help, privacy, terms
components/
  Landing.tsx         landing page (with a live demo of the surprise)
  Surprise.tsx        the interactive surprise (full screen, demo, side preview, thumbnails)
  Sticker.tsx         original SVG bear sticker with moods
  Creator.tsx         the wizard
  Decorations.tsx     petals / confetti / stars / balloons backgrounds
lib/
  occasions.ts        every occasion: wording, starter letters, starter quiz, finale, default design
  themes.ts           6 designs (Sweet Pink is the default)
  draft.ts            browser storage + on-device photo resizing
  site.ts             name, limits, FAQs
```

## Customising

- **Brand name:** `SITE_NAME` in `lib/site.ts`.
- **New occasion:** add an object to `OCCASIONS` in `lib/occasions.ts` — its page, wizard option and sitemap
  entry appear automatically.
- **New design:** add an object to `THEMES` in `lib/themes.ts`.
- **Texts on the surprise screens:** per-occasion words in `lib/occasions.ts`; shared ones in `NO_STEPS`,
  `FINALE_COPY` and the screen blocks in `components/Surprise.tsx`.

## Adding sharing later

To send a wish to someone on another device you'll need somewhere to store it (e.g. Next.js route handlers +
object storage). The wish is already a single plain object (`Draft` in `lib/draft.ts`), so it can be posted as-is.
