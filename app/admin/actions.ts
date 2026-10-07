"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import {
  checkPassword,
  clearAdminSession,
  clientIp,
  isAdmin,
  rateLimit,
  setAdminSession,
} from "@/lib/security";
import {
  cleanup,
  deleteWish,
  getManagedThemes,
  saveFaqs,
  saveTemplateSettings,
  updateWish,
  type Faq,
} from "@/lib/repo";

async function guard() {
  if (!(await isAdmin())) redirect("/admin");
}

export async function login(formData: FormData) {
  const ip = await clientIp();
  if (!rateLimit(`login:${ip}`, 8, 15 * 60_000).ok) redirect("/admin?error=locked");
  if (!checkPassword(String(formData.get("password") ?? ""))) redirect("/admin?error=1");
  await setAdminSession();
  redirect("/admin");
}

export async function logout() {
  await clearAdminSession();
  redirect("/admin");
}

async function writeThemes(mutate: (list: Awaited<ReturnType<typeof getManagedThemes>>) => void) {
  const list = await getManagedThemes();
  mutate(list);
  await saveTemplateSettings(
    list.map((t, i) => ({ id: t.id, active: t.active, order: i, description: t.description })),
  );
  revalidatePath("/", "layout");
}

export async function toggleTemplate(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  await writeThemes((list) => {
    const t = list.find((x) => x.id === id);
    if (!t) return;
    // never allow deactivating the last active theme
    if (t.active && list.filter((x) => x.active).length === 1) return;
    t.active = !t.active;
  });
}

export async function moveTemplate(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const dir = formData.get("dir") === "up" ? -1 : 1;
  await writeThemes((list) => {
    const i = list.findIndex((x) => x.id === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= list.length) return;
    [list[i], list[j]] = [list[j], list[i]];
  });
}

export async function saveTemplateDescription(formData: FormData) {
  await guard();
  const id = String(formData.get("id"));
  const description = String(formData.get("description") ?? "").trim().slice(0, 120);
  await writeThemes((list) => {
    const t = list.find((x) => x.id === id);
    if (t && description) t.description = description;
  });
}

export async function removeWish(formData: FormData) {
  await guard();
  await deleteWish(String(formData.get("slug")));
  revalidatePath("/admin");
}

export async function restoreWish(formData: FormData) {
  await guard();
  await updateWish(String(formData.get("slug")), (w) => ({ ...w, hidden: false, reports: 0 }));
  revalidatePath("/admin");
}

export async function updateFaqs(formData: FormData) {
  await guard();
  const faqs: Faq[] = [];
  for (let i = 0; i < 50; i++) {
    const q = String(formData.get(`q_${i}`) ?? "").trim().slice(0, 200);
    const a = String(formData.get(`a_${i}`) ?? "").trim().slice(0, 1000);
    if (q && a) faqs.push({ q, a });
  }
  await saveFaqs(faqs);
  revalidatePath("/", "layout");
  redirect("/admin?tab=content&saved=1");
}

export async function runCleanup() {
  await guard();
  const r = await cleanup();
  revalidatePath("/admin");
  redirect(`/admin?tab=wishes&cleaned=${r.expired}-${r.orphans}`);
}
