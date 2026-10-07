"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { Theme } from "@/lib/themes";
import { shrinkImage, trackClient } from "@/lib/client";
import { WishCard } from "./WishCard";
import { ThemeThumb } from "./ThemeThumb";
import { Logo } from "./SiteChrome";

interface Photo {
  key: string;
  status: "uploading" | "done" | "error";
  preview: string; // local object URL or server URL
  id?: string;
  url?: string;
  error?: string;
}

interface Props {
  themes: Theme[];
  initialThemeId: string;
  suggestions: string[];
  limits: { maxPhotos: number; maxNameLength: number; maxMessageLength: number };
}

const STEPS = ["Names", "Photos", "Message", "Design", "Preview"] as const;
const DRAFT_KEY = "wish-draft-v1";
const ACCEPT = "image/jpeg,image/png,image/webp,image/gif,image/avif,image/heic,image/heif";

export function Creator({ themes, initialThemeId, suggestions, limits }: Props) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [recipientName, setRecipient] = useState("");
  const [senderName, setSender] = useState("");
  const [message, setMessage] = useState("");
  const [themeId, setThemeId] = useState(initialThemeId);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [restored, setRestored] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);
  const replaceKey = useRef<string | null>(null);
  const topRef = useRef<HTMLDivElement>(null);

  const theme = themes.find((t) => t.id === themeId) ?? themes[0];
  const donePhotos = photos.filter((p) => p.status === "done");
  const previewPhotos = photos.filter((p) => p.status !== "error").map((p) => p.preview);

  /* ---- draft persistence (survives an accidental refresh) ---- */
  useEffect(() => {
    trackClient("creator_started");
    try {
      const raw = sessionStorage.getItem(DRAFT_KEY);
      if (raw) {
        const d = JSON.parse(raw);
        setRecipient(d.recipientName ?? "");
        setSender(d.senderName ?? "");
        setMessage(d.message ?? "");
        if (themes.some((t) => t.id === d.themeId) && !new URLSearchParams(location.search).get("theme")) setThemeId(d.themeId);
        if (Array.isArray(d.photos))
          setPhotos(d.photos.map((p: { id: string; url: string }) => ({ key: p.id, id: p.id, url: p.url, preview: p.url, status: "done" })));
        if (typeof d.step === "number") setStep(Math.min(d.step, STEPS.length - 1));
      }
    } catch {}
    setRestored(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!restored) return;
    try {
      sessionStorage.setItem(
        DRAFT_KEY,
        JSON.stringify({
          step,
          recipientName,
          senderName,
          message,
          themeId,
          photos: donePhotos.map((p) => ({ id: p.id, url: p.url })),
        }),
      );
    } catch {}
  }, [restored, step, recipientName, senderName, message, themeId, photos]); // eslint-disable-line react-hooks/exhaustive-deps

  /* ---- photos ---- */
  async function upload(file: File, key: string) {
    if (!file.type.startsWith("image/") && file.type !== "") {
      return updatePhoto(key, { status: "error", error: "That file isn't a photo." });
    }
    if (file.size > 30 * 1024 * 1024) {
      return updatePhoto(key, { status: "error", error: "That photo is too large." });
    }
    try {
      const blob = await shrinkImage(file);
      if (blob.size > 10 * 1024 * 1024) {
        return updatePhoto(key, { status: "error", error: "Too large — max 10 MB." });
      }
      const fd = new FormData();
      fd.append("photo", blob, file.name || "photo.jpg");
      const res = await fetch("/api/upload", { method: "POST", body: fd });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) return updatePhoto(key, { status: "error", error: data.error || "Upload failed." });
      updatePhoto(key, { status: "done", id: data.id, url: data.url });
    } catch {
      updatePhoto(key, { status: "error", error: "Upload failed — check your connection." });
    }
  }

  function updatePhoto(key: string, patch: Partial<Photo>) {
    setPhotos((ps) => ps.map((p) => (p.key === key ? { ...p, ...patch } : p)));
  }

  function onFiles(list: FileList | null) {
    if (!list?.length) return;
    setError(null);
    const files = Array.from(list);

    if (replaceKey.current) {
      const key = replaceKey.current;
      replaceKey.current = null;
      const f = files[0];
      const newKey = crypto.randomUUID();
      setPhotos((ps) =>
        ps.map((p) => (p.key === key ? { key: newKey, status: "uploading", preview: URL.createObjectURL(f) } : p)),
      );
      upload(f, newKey);
      return;
    }

    const room = limits.maxPhotos - photos.length;
    if (room <= 0) return setError(`You can add up to ${limits.maxPhotos} photos.`);
    if (files.length > room) setError(`Only the first ${room} photo${room > 1 ? "s were" : " was"} added (max ${limits.maxPhotos}).`);
    const added = files.slice(0, room).map((f) => ({
      file: f,
      photo: { key: crypto.randomUUID(), status: "uploading" as const, preview: URL.createObjectURL(f) },
    }));
    setPhotos((ps) => [...ps, ...added.map((a) => a.photo)]);
    added.forEach((a) => upload(a.file, a.photo.key));
  }

  function pick(replace?: string) {
    replaceKey.current = replace ?? null;
    if (fileInput.current) {
      fileInput.current.multiple = !replace;
      fileInput.current.value = "";
      fileInput.current.click();
    }
  }

  function makeMain(key: string) {
    setPhotos((ps) => {
      const p = ps.find((x) => x.key === key);
      return p ? [p, ...ps.filter((x) => x.key !== key)] : ps;
    });
  }

  /* ---- navigation ---- */
  function validate(s: number): string | null {
    if (s === 0) {
      if (!recipientName.trim()) return "Please enter the birthday person's name.";
      if (!senderName.trim()) return "Please enter your name.";
    }
    if (s === 1) {
      if (photos.some((p) => p.status === "uploading")) return "Hang on — your photos are still uploading.";
      if (photos.some((p) => p.status === "error")) return "Please remove or replace the photos that didn't upload.";
      if (donePhotos.length === 0) return "Please add at least one photo.";
    }
    if (s === 2 && !message.trim()) return "Please write a birthday message, or pick a suggestion.";
    return null;
  }

  function go(to: number) {
    if (to > step) {
      for (let s = step; s < to; s++) {
        const e = validate(s);
        if (e) {
          setStep(s);
          setError(e);
          return;
        }
      }
    }
    setError(null);
    setStep(to);
    topRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  async function submit() {
    for (let s = 0; s < 4; s++) {
      const e = validate(s);
      if (e) {
        setStep(s);
        setError(e);
        return;
      }
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/wishes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          recipientName,
          senderName,
          message,
          themeId,
          photoIds: donePhotos.map((p) => p.id),
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
      try {
        sessionStorage.removeItem(DRAFT_KEY);
      } catch {}
      router.push(`/w/${data.slug}/share`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  }

  const input =
    "w-full rounded-2xl border-2 border-line bg-white px-4 py-3.5 text-lg outline-none transition placeholder:text-ink-soft/50 focus:border-coral focus-visible:outline-none";

  /* ---- render ---- */
  return (
    <div className="min-h-dvh bg-sand/50">
      <div ref={topRef} />
      <header className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <Logo />
        <Link href="/" className="text-sm font-medium text-ink-soft hover:text-ink">
          Cancel
        </Link>
      </header>

      <div className="mx-auto grid max-w-6xl gap-10 px-5 pb-36 lg:grid-cols-[1fr_380px] lg:pb-16">
        <div>
          {/* Progress */}
          <ol className="mb-6 flex gap-1.5" aria-label="Progress">
            {STEPS.map((label, i) => (
              <li key={label} className="flex-1">
                <button
                  type="button"
                  onClick={() => i < step && go(i)}
                  disabled={i >= step}
                  className="group w-full text-left disabled:cursor-default"
                  aria-current={i === step ? "step" : undefined}
                >
                  <span className={`block h-1.5 rounded-full transition ${i <= step ? "bg-coral" : "bg-line"}`} />
                  <span
                    className={`mt-2 hidden text-xs font-medium sm:block ${i === step ? "text-ink" : "text-ink-soft"} ${i < step ? "group-hover:text-coral" : ""}`}
                  >
                    {label}
                  </span>
                </button>
              </li>
            ))}
          </ol>
          <p className="mb-2 text-sm font-medium text-ink-soft sm:hidden">
            Step {step + 1} of {STEPS.length} · {STEPS[step]}
          </p>

          <div className="rounded-[2rem] bg-white p-6 shadow-sm sm:p-9">
            {step === 0 && (
              <div className="space-y-7">
                <StepTitle title="Who's celebrating?" sub="Their name will be the star of the page." />
                <Field label="Birthday person's name" htmlFor="recipient">
                  <input
                    id="recipient"
                    className={input}
                    value={recipientName}
                    maxLength={limits.maxNameLength}
                    onChange={(e) => setRecipient(e.target.value)}
                    placeholder="e.g. Ayesha"
                    autoComplete="off"
                    autoFocus
                    onKeyDown={(e) => e.key === "Enter" && document.getElementById("sender")?.focus()}
                  />
                </Field>
                <Field label="Your name" htmlFor="sender" hint="Shown as “With love, …”">
                  <input
                    id="sender"
                    className={input}
                    value={senderName}
                    maxLength={limits.maxNameLength}
                    onChange={(e) => setSender(e.target.value)}
                    placeholder="e.g. Sara, or The Khan Family"
                    autoComplete="name"
                    onKeyDown={(e) => e.key === "Enter" && go(1)}
                  />
                </Field>
              </div>
            )}

            {step === 1 && (
              <div>
                <StepTitle
                  title="Add some photos"
                  sub={`Up to ${limits.maxPhotos}. The first one is the main photo.`}
                />
                <input
                  ref={fileInput}
                  type="file"
                  accept={ACCEPT}
                  className="hidden"
                  onChange={(e) => onFiles(e.target.files)}
                />
                <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-4">
                  {photos.map((p, i) => (
                    <div key={p.key} className="relative">
                      <button
                        type="button"
                        onClick={() => pick(p.key)}
                        className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-sand"
                        aria-label="Replace photo"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={p.preview}
                          alt=""
                          className={`h-full w-full object-cover ${p.status !== "done" ? "opacity-50" : ""}`}
                        />
                        {p.status === "uploading" && (
                          <span className="absolute inset-0 flex items-center justify-center">
                            <span className="h-8 w-8 animate-spin rounded-full border-4 border-white border-t-coral" />
                          </span>
                        )}
                        {p.status === "error" && (
                          <span className="absolute inset-x-0 bottom-0 bg-coral-dark/95 p-2 text-xs font-medium text-white">
                            {p.error} Tap to replace.
                          </span>
                        )}
                        {i === 0 && p.status === "done" && (
                          <span className="absolute top-2 left-2 rounded-full bg-ink/80 px-2 py-0.5 text-[11px] font-semibold text-white">
                            Main
                          </span>
                        )}
                      </button>
                      <button
                        type="button"
                        onClick={() => setPhotos((ps) => ps.filter((x) => x.key !== p.key))}
                        className="absolute -top-2 -right-2 flex h-8 w-8 items-center justify-center rounded-full bg-ink text-white shadow"
                        aria-label="Remove photo"
                      >
                        ×
                      </button>
                      {i > 0 && p.status === "done" && (
                        <button
                          type="button"
                          onClick={() => makeMain(p.key)}
                          className="mt-1.5 w-full text-center text-xs font-medium text-ink-soft hover:text-coral"
                        >
                          Make main
                        </button>
                      )}
                    </div>
                  ))}
                  {photos.length < limits.maxPhotos && (
                    <button
                      type="button"
                      onClick={() => pick()}
                      className={`flex aspect-square flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-coral/40 bg-coral-soft/40 text-coral-dark transition hover:border-coral hover:bg-coral-soft ${photos.length === 0 ? "col-span-2 aspect-auto py-12 sm:col-span-4" : ""}`}
                    >
                      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-coral text-3xl leading-none text-white">
                        +
                      </span>
                      <span className="font-semibold">{photos.length ? "Add more" : "Choose photos"}</span>
                      {photos.length === 0 && (
                        <span className="text-sm text-ink-soft">JPG, PNG or WebP · up to 10 MB each</span>
                      )}
                    </button>
                  )}
                </div>
                <p className="mt-6 text-sm text-ink-soft">
                  Tap a photo to replace it. We remove hidden location data from every photo.
                </p>
              </div>
            )}

            {step === 2 && (
              <div>
                <StepTitle
                  title="Write your message"
                  sub={`Say it your way to ${recipientName.trim() || "them"}, or start from a suggestion.`}
                />
                <div className="mt-7">
                  <textarea
                    id="message"
                    className={`${input} min-h-44 resize-y leading-relaxed`}
                    value={message}
                    maxLength={limits.maxMessageLength}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Happy birthday! …"
                    aria-label="Birthday message"
                    autoFocus
                  />
                  <p
                    className={`mt-1.5 text-right text-xs ${message.length > limits.maxMessageLength - 40 ? "text-coral-dark" : "text-ink-soft"}`}
                  >
                    {message.length}/{limits.maxMessageLength}
                  </p>
                </div>
                <p className="mt-4 text-sm font-semibold">Need inspiration?</p>
                <div className="mt-3 space-y-2">
                  {suggestions.map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setMessage(s)}
                      className={`block w-full rounded-2xl border-2 px-4 py-3 text-left text-sm transition ${message === s ? "border-coral bg-coral-soft/50" : "border-line hover:border-coral/50"}`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 3 && (
              <div>
                <StepTitle title="Choose a design" sub="Shown with your photos and names." />
                <div className="mt-7 grid grid-cols-2 gap-4 sm:grid-cols-3" role="radiogroup" aria-label="Design">
                  {themes.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      role="radio"
                      aria-checked={t.id === themeId}
                      onClick={() => setThemeId(t.id)}
                      className={`overflow-hidden rounded-2xl border-2 text-left transition ${t.id === themeId ? "border-coral ring-4 ring-coral/20" : "border-line hover:border-coral/50"}`}
                    >
                      <div className="flex justify-center" style={{ background: t.colors.background }}>
                        <ThemeThumb
                          theme={t}
                          recipientName={recipientName || "Their name"}
                          senderName={senderName || "You"}
                          message={message || "Happy birthday!"}
                          photos={previewPhotos.length ? previewPhotos : ["/sample-cake.svg"]}
                          scale={0.38}
                          height={240}
                        />
                      </div>
                      <div className="flex items-center justify-between gap-2 border-t border-line bg-white px-3 py-2.5">
                        <span className="text-sm font-semibold">{t.name}</span>
                        {t.id === themeId && (
                          <span className="flex h-5 w-5 items-center justify-center rounded-full bg-coral text-xs text-white">✓</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {step === 4 && (
              <div>
                <StepTitle title="Looking good!" sub="Check everything, then create your shareable page." />
                <dl className="mt-7 divide-y divide-line rounded-2xl border border-line">
                  <Summary label="For" value={recipientName} onEdit={() => go(0)} />
                  <Summary label="From" value={senderName} onEdit={() => go(0)} />
                  <Summary label="Photos" value={`${donePhotos.length} photo${donePhotos.length === 1 ? "" : "s"}`} onEdit={() => go(1)} />
                  <Summary label="Message" value={message} onEdit={() => go(2)} clamp />
                  <Summary label="Design" value={theme?.name ?? ""} onEdit={() => go(3)} />
                </dl>
                <div className="mt-8 overflow-hidden rounded-3xl border border-line lg:hidden">
                  {theme && (
                    <WishCard theme={theme} recipientName={recipientName} senderName={senderName} message={message} photos={previewPhotos} />
                  )}
                </div>
              </div>
            )}

            {error && (
              <p role="alert" className="mt-6 rounded-2xl bg-coral-soft px-4 py-3 text-sm font-medium text-coral-dark">
                {error}
              </p>
            )}

            {/* Desktop actions */}
            <div className="mt-9 hidden items-center justify-between lg:flex">
              <BackButton step={step} onBack={() => go(step - 1)} />
              <NextButton step={step} submitting={submitting} onNext={() => go(step + 1)} onSubmit={submit} />
            </div>
          </div>
        </div>

        {/* Desktop live preview */}
        <aside className="hidden lg:block">
          <div className="sticky top-6">
            <p className="mb-3 text-center text-sm font-medium text-ink-soft">Live preview</p>
            <div className="overflow-hidden rounded-[2.4rem] border-[10px] border-ink bg-ink shadow-xl">
              <div className="h-[640px] overflow-y-auto rounded-[1.7rem]">
                {theme && (
                  <WishCard
                    preview
                    theme={theme}
                    recipientName={recipientName}
                    senderName={senderName}
                    message={message}
                    photos={previewPhotos}
                  />
                )}
              </div>
            </div>
          </div>
        </aside>
      </div>

      {/* Mobile action bar */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-white/95 px-4 pt-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
        <div className="mx-auto flex max-w-xl items-center gap-3">
          {step > 0 ? (
            <button
              type="button"
              onClick={() => go(step - 1)}
              className="h-14 w-14 shrink-0 rounded-full border-2 border-line text-xl"
              aria-label="Back"
            >
              ←
            </button>
          ) : null}
          {step < 4 && (
            <button
              type="button"
              onClick={() => setShowPreview(true)}
              className="h-14 shrink-0 rounded-full border-2 border-line px-4 text-sm font-semibold"
            >
              Preview
            </button>
          )}
          <NextButton step={step} submitting={submitting} onNext={() => go(step + 1)} onSubmit={submit} full />
        </div>
      </div>

      {/* Mobile preview sheet */}
      {showPreview && theme && (
        <div className="fixed inset-0 z-30 flex flex-col bg-ink/95 lg:hidden" role="dialog" aria-modal aria-label="Preview">
          <div className="flex items-center justify-between px-5 py-3 text-white">
            <span className="font-medium">Preview</span>
            <button type="button" onClick={() => setShowPreview(false)} className="rounded-full bg-white/15 px-4 py-2 text-sm font-semibold">
              Close
            </button>
          </div>
          <div className="mx-3 mb-3 flex-1 overflow-y-auto rounded-3xl">
            <WishCard
              preview
              theme={theme}
              recipientName={recipientName}
              senderName={senderName}
              message={message}
              photos={previewPhotos}
            />
          </div>
        </div>
      )}
    </div>
  );
}

function StepTitle({ title, sub }: { title: string; sub: string }) {
  return (
    <div>
      <h1 className="font-display text-3xl font-semibold sm:text-4xl">{title}</h1>
      <p className="mt-2 text-ink-soft">{sub}</p>
    </div>
  );
}

function Field({ label, htmlFor, hint, children }: { label: string; htmlFor: string; hint?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-2 flex items-baseline justify-between font-semibold">
        {label}
        {hint && <span className="text-sm font-normal text-ink-soft">{hint}</span>}
      </label>
      {children}
    </div>
  );
}

function Summary({ label, value, onEdit, clamp }: { label: string; value: string; onEdit: () => void; clamp?: boolean }) {
  return (
    <div className="flex items-start gap-4 px-4 py-3">
      <dt className="w-20 shrink-0 text-sm text-ink-soft">{label}</dt>
      <dd className={`min-w-0 flex-1 font-medium break-words ${clamp ? "line-clamp-2" : ""}`}>{value}</dd>
      <button type="button" onClick={onEdit} className="text-sm font-semibold text-coral hover:underline">
        Edit
      </button>
    </div>
  );
}

function BackButton({ step, onBack }: { step: number; onBack: () => void }) {
  if (step === 0) return <span />;
  return (
    <button type="button" onClick={onBack} className="rounded-full px-5 py-3 font-semibold text-ink-soft hover:text-ink">
      ← Back
    </button>
  );
}

function NextButton({
  step,
  submitting,
  onNext,
  onSubmit,
  full,
}: {
  step: number;
  submitting: boolean;
  onNext: () => void;
  onSubmit: () => void;
  full?: boolean;
}) {
  const last = step === STEPS.length - 1;
  return (
    <button
      type="button"
      onClick={last ? onSubmit : onNext}
      disabled={submitting}
      className={`h-14 rounded-full bg-coral px-6 text-lg whitespace-nowrap font-semibold text-white shadow-lg shadow-coral/25 transition hover:bg-coral-dark active:scale-[0.98] disabled:opacity-60 ${full ? "flex-1" : ""}`}
    >
      {submitting ? "Creating…" : last ? "Create my wish 🎉" : full ? "Next" : `Next: ${STEPS[step + 1]}`}
    </button>
  );
}
