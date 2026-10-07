import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/SiteChrome";
import { SurpriseThumb } from "@/components/SurpriseThumb";
import { getFaqs, getManagedThemes, getStats, isExpired, listWishes } from "@/lib/repo";
import { adminEnabled, isAdmin } from "@/lib/security";
import {
  login,
  logout,
  moveTemplate,
  removeWish,
  restoreWish,
  runCleanup,
  saveTemplateDescription,
  toggleTemplate,
  updateFaqs,
} from "./actions";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

type Search = { searchParams: Promise<{ tab?: string; error?: string; saved?: string; cleaned?: string }> };

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "wishes", label: "Wishes" },
  { id: "templates", label: "Templates" },
  { id: "content", label: "Help content" },
];

const card = "rounded-3xl border border-line bg-white p-6";
const smallBtn = "rounded-full border border-line px-3 py-1.5 text-sm font-medium hover:border-ink/40";

export default async function AdminPage({ searchParams }: Search) {
  const sp = await searchParams;

  if (!adminEnabled()) {
    return (
      <Shell>
        <div className={`${card} max-w-md`}>
          <h1 className="font-display text-2xl font-semibold">Admin is disabled</h1>
          <p className="mt-2 text-ink-soft">
            Set <code className="rounded bg-sand px-1">ADMIN_PASSWORD</code> in your environment to enable it.
          </p>
        </div>
      </Shell>
    );
  }

  if (!(await isAdmin())) {
    return (
      <Shell>
        <form action={login} className={`${card} mx-auto mt-10 w-full max-w-sm`}>
          <h1 className="font-display text-2xl font-semibold">Admin sign in</h1>
          <input
            type="password"
            name="password"
            required
            autoFocus
            autoComplete="current-password"
            placeholder="Password"
            className="mt-5 w-full rounded-2xl border-2 border-line px-4 py-3 outline-none focus:border-coral"
          />
          {sp.error && (
            <p className="mt-3 text-sm text-coral-dark">
              {sp.error === "locked" ? "Too many attempts. Try again in 15 minutes." : "Wrong password."}
            </p>
          )}
          <button className="mt-5 w-full rounded-full bg-ink py-3 font-semibold text-cream hover:bg-coral">Sign in</button>
        </form>
      </Shell>
    );
  }

  const tab = TABS.some((t) => t.id === sp.tab) ? sp.tab! : "overview";

  return (
    <Shell
      right={
        <form action={logout}>
          <button className={smallBtn}>Sign out</button>
        </form>
      }
    >
      <nav className="mb-8 flex gap-2 overflow-x-auto">
        {TABS.map((t) => (
          <Link
            key={t.id}
            href={`/admin?tab=${t.id}`}
            className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold ${tab === t.id ? "bg-ink text-cream" : "bg-white text-ink-soft hover:text-ink"}`}
          >
            {t.label}
          </Link>
        ))}
      </nav>
      {tab === "overview" && <Overview />}
      {tab === "wishes" && <Wishes cleaned={sp.cleaned} />}
      {tab === "templates" && <Templates />}
      {tab === "content" && <Content saved={!!sp.saved} />}
    </Shell>
  );
}

function Shell({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="min-h-dvh bg-sand/50">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <div className="flex items-center gap-3">
          <Logo />
          <span className="rounded-full bg-ink px-2.5 py-0.5 text-xs font-semibold text-cream">Admin</span>
        </div>
        {right}
      </header>
      <main className="mx-auto max-w-6xl px-5 pt-4 pb-20">{children}</main>
    </div>
  );
}

/* ---------------------------------------------------------------- Overview */

async function Overview() {
  const [stats, wishes] = await Promise.all([getStats(), listWishes()]);
  const t = stats.totals;
  const live = wishes.filter((w) => !isExpired(w));
  const reported = wishes.filter((w) => w.reports > 0).length;
  const shares = (t.share_copy ?? 0) + (t.share_whatsapp ?? 0) + (t.share_native ?? 0) + (t.share_email ?? 0);
  const conversion = t.creator_started ? Math.min(100, Math.round(((t.wish_created ?? 0) / t.creator_started) * 100)) : 0;

  const days = Array.from({ length: 14 }, (_, i) => {
    const d = new Date(Date.now() - (13 - i) * 86_400_000).toISOString().slice(0, 10);
    return { d, created: stats.daily[d]?.wish_created ?? 0, views: stats.daily[d]?.wish_viewed ?? 0 };
  });
  const max = Math.max(1, ...days.map((d) => d.created));

  const tiles = [
    { label: "Wishes created", value: t.wish_created ?? 0 },
    { label: "Live wishes", value: live.length },
    { label: "Wish views", value: t.wish_viewed ?? 0 },
    { label: "Shares", value: shares },
    { label: "Start → create", value: `${conversion}%` },
    { label: "Reported", value: reported },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
        {tiles.map((x) => (
          <div key={x.label} className={card}>
            <p className="text-sm text-ink-soft">{x.label}</p>
            <p className="mt-1 font-display text-3xl font-semibold tabular-nums">{x.value}</p>
          </div>
        ))}
      </div>
      <div className={card}>
        <h2 className="font-semibold">Wishes created — last 14 days</h2>
        <div className="mt-6 flex h-40 items-end gap-1.5">
          {days.map((d) => (
            <div key={d.d} className="group relative flex h-full flex-1 flex-col justify-end">
              <div
                className="rounded-t-md bg-coral transition group-hover:bg-coral-dark"
                style={{ height: `${(d.created / max) * 100}%`, minHeight: d.created ? 4 : 1 }}
              />
              <span className="pointer-events-none absolute -top-7 left-1/2 hidden -translate-x-1/2 rounded bg-ink px-2 py-0.5 text-xs whitespace-nowrap text-cream group-hover:block">
                {d.created} created · {d.views} views
              </span>
            </div>
          ))}
        </div>
        <div className="mt-2 flex justify-between text-xs text-ink-soft">
          <span>{days[0].d.slice(5)}</span>
          <span>{days[13].d.slice(5)}</span>
        </div>
      </div>
      <div className={card}>
        <h2 className="font-semibold">Sharing breakdown</h2>
        <dl className="mt-4 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
          {[
            ["WhatsApp", t.share_whatsapp],
            ["Copy link", t.share_copy],
            ["Native share", t.share_native],
            ["Email", t.share_email],
          ].map(([k, v]) => (
            <div key={k as string}>
              <dt className="text-ink-soft">{k}</dt>
              <dd className="text-xl font-semibold tabular-nums">{(v as number) ?? 0}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ Wishes */

async function Wishes({ cleaned }: { cleaned?: string }) {
  const wishes = (await listWishes()).sort((a, b) => Number(b.reports > 0) - Number(a.reports > 0));
  return (
    <div className={card}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-semibold">All wishes ({wishes.length})</h2>
        <form action={runCleanup}>
          <button className={smallBtn}>Delete expired now</button>
        </form>
      </div>
      {cleaned && (
        <p className="mt-3 rounded-xl bg-sand px-3 py-2 text-sm">
          Cleanup done: {cleaned.split("-")[0]} expired wishes and {cleaned.split("-")[1]} unused photos removed.
        </p>
      )}
      {wishes.length === 0 ? (
        <p className="mt-6 text-ink-soft">No wishes yet.</p>
      ) : (
        <div className="-mx-6 mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="border-b border-line text-ink-soft">
              <tr>
                <th className="px-6 py-2 font-medium">For / From</th>
                <th className="py-2 font-medium">Created</th>
                <th className="py-2 font-medium">Views</th>
                <th className="py-2 font-medium">Status</th>
                <th className="px-6 py-2 text-right font-medium">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {wishes.map((w) => {
                const status = isExpired(w) ? "Expired" : w.hidden ? "Hidden" : w.reports ? `${w.reports} report(s)` : "Live";
                return (
                  <tr key={w.slug} className={w.reports ? "bg-coral-soft/30" : ""}>
                    <td className="px-6 py-3">
                      <p className="font-medium">{w.recipientName}</p>
                      <p className="text-ink-soft">from {w.senderName}</p>
                    </td>
                    <td className="py-3 text-ink-soft">{new Date(w.createdAt).toLocaleDateString("en-GB")}</td>
                    <td className="py-3 tabular-nums">{w.views}</td>
                    <td className="py-3">{status}</td>
                    <td className="px-6 py-3">
                      <div className="flex justify-end gap-2">
                        <a href={`/w/${w.slug}`} target="_blank" className={smallBtn}>
                          Open
                        </a>
                        {(w.hidden || w.reports > 0) && (
                          <form action={restoreWish}>
                            <input type="hidden" name="slug" value={w.slug} />
                            <button className={smallBtn}>Approve</button>
                          </form>
                        )}
                        <details className="relative">
                          <summary className={`${smallBtn} list-none text-coral-dark`}>Delete</summary>
                          <form action={removeWish} className="absolute right-0 z-10 mt-2 w-52 rounded-2xl border border-line bg-white p-3 shadow-lg">
                            <input type="hidden" name="slug" value={w.slug} />
                            <p className="text-xs text-ink-soft">Permanently delete this wish and its photos?</p>
                            <button className="mt-2 w-full rounded-full bg-coral py-1.5 text-sm font-semibold text-white">
                              Delete
                            </button>
                          </form>
                        </details>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* --------------------------------------------------------------- Templates */

async function Templates() {
  const themes = await getManagedThemes();
  return (
    <div className="space-y-4">
      <p className="text-sm text-ink-soft">
        Inactive templates are hidden from the creator; existing wishes keep their design. New designs are added in{" "}
        <code className="rounded bg-white px-1">lib/themes.ts</code> and appear here after deploy.
      </p>
      {themes.map((t, i) => (
        <div key={t.id} className={`${card} flex flex-col gap-5 sm:flex-row sm:items-center ${t.active ? "" : "opacity-60"}`}>
          <div className="shrink-0 overflow-hidden rounded-2xl border border-line">
            <SurpriseThumb theme={t} scale={0.3} height={170} />
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold">{t.name}</h3>
              <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${t.active ? "bg-teal/15 text-teal" : "bg-sand text-ink-soft"}`}>
                {t.active ? "Active" : "Inactive"}
              </span>
            </div>
            <form action={saveTemplateDescription} className="mt-3 flex gap-2">
              <input type="hidden" name="id" value={t.id} />
              <input
                name="description"
                defaultValue={t.description}
                maxLength={120}
                className="min-w-0 flex-1 rounded-xl border border-line px-3 py-2 text-sm"
                aria-label="Description"
              />
              <button className={smallBtn}>Save</button>
            </form>
          </div>
          <div className="flex gap-2">
            <form action={moveTemplate}>
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="dir" value="up" />
              <button className={smallBtn} disabled={i === 0} aria-label="Move up">↑</button>
            </form>
            <form action={moveTemplate}>
              <input type="hidden" name="id" value={t.id} />
              <input type="hidden" name="dir" value="down" />
              <button className={smallBtn} disabled={i === themes.length - 1} aria-label="Move down">↓</button>
            </form>
            <form action={toggleTemplate}>
              <input type="hidden" name="id" value={t.id} />
              <button className={smallBtn}>{t.active ? "Deactivate" : "Activate"}</button>
            </form>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ----------------------------------------------------------------- Content */

async function Content({ saved }: { saved: boolean }) {
  const faqs = await getFaqs();
  const rows = [...faqs, { q: "", a: "" }, { q: "", a: "" }];
  return (
    <form action={updateFaqs} className={`${card} space-y-6`}>
      <div>
        <h2 className="font-semibold">Help page FAQs</h2>
        <p className="mt-1 text-sm text-ink-soft">
          Shown on the Help page (and the first four on the home page). Clear both fields to remove one.
        </p>
      </div>
      {saved && <p className="rounded-xl bg-teal/10 px-3 py-2 text-sm text-teal">Saved.</p>}
      {rows.map((f, i) => (
        <div key={i} className="grid gap-2 border-t border-line pt-5">
          <input
            name={`q_${i}`}
            defaultValue={f.q}
            placeholder="Question"
            className="rounded-xl border border-line px-3 py-2 font-medium"
          />
          <textarea
            name={`a_${i}`}
            defaultValue={f.a}
            placeholder="Answer"
            rows={2}
            className="rounded-xl border border-line px-3 py-2 text-sm"
          />
        </div>
      ))}
      <button className="rounded-full bg-ink px-6 py-3 font-semibold text-cream hover:bg-coral">Save FAQs</button>
    </form>
  );
}
