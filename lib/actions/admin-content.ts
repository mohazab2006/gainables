"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS, PUBLIC_CACHE_TAGS } from "@/lib/cache-tags";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

/* -------------------------------------------------------------------------- */
/*  Shared helpers                                                            */
/* -------------------------------------------------------------------------- */

function redirectWithMessage(path: string, type: "success" | "error", message: string): never {
  const params = new URLSearchParams({ type, message });
  redirect(`${path}?${params.toString()}`);
}

function str(formData: FormData, name: string) {
  return String(formData.get(name) ?? "").trim();
}

function parseJsonArray<T>(formData: FormData, name: string, path: string): T[] {
  const raw = String(formData.get(name) ?? "[]");
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) throw new Error("Not an array");
    return parsed as T[];
  } catch (error) {
    const message = error instanceof Error ? error.message : "Invalid array payload.";
    redirectWithMessage(path, "error", `Unable to save: ${message}`);
  }
}

function refreshPublicSite() {
  PUBLIC_CACHE_TAGS.forEach((tag) => updateTag(tag));
  revalidatePath("/");
  revalidatePath("/donate");
  revalidatePath("/track");
  revalidatePath("/faq");
}

/**
 * Persists a typed site-content section by writing the structured object back
 * to the `site_content` table under `key`, then revalidating public routes.
 */
async function persistSection(key: string, value: unknown, path: string, label: string) {
  await requireAuthorizedAdmin(path);

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("site_content").upsert({
    key,
    value: value as never,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirectWithMessage(path, "error", `Unable to save ${label}: ${error.message}`);
  }

  updateTag(CACHE_TAGS.siteContent);
  refreshPublicSite();
  revalidatePath(path);
  redirectWithMessage(path, "success", `Saved ${label}.`);
}

/* -------------------------------------------------------------------------- */
/*  Hero                                                                      */
/* -------------------------------------------------------------------------- */

export async function saveHero(formData: FormData) {
  const path = "/admin/content/hero";
  const value = {
    eyebrow: str(formData, "eyebrow"),
    description: str(formData, "description"),
  };
  await persistSection("hero", value, path, "hero");
}

/* -------------------------------------------------------------------------- */
/*  Why it matters                                                            */
/* -------------------------------------------------------------------------- */

export async function saveWhyItMatters(formData: FormData) {
  const path = "/admin/content/why-it-matters";
  const value = {
    title: str(formData, "title"),
    body: str(formData, "body"),
  };
  await persistSection("why_it_matters", value, path, "why it matters");
}

/* -------------------------------------------------------------------------- */
/*  Media                                                                     */
/* -------------------------------------------------------------------------- */

type MediaLinkRow = { label: string; handle: string; href: string; description: string };

export async function saveMedia(formData: FormData) {
  const path = "/admin/content/media";
  const links = parseJsonArray<MediaLinkRow>(formData, "links", path);
  const value = {
    body: str(formData, "body"),
    links: links.map((l) => ({
      label: String(l.label ?? ""),
      handle: String(l.handle ?? ""),
      href: String(l.href ?? ""),
      description: String(l.description ?? ""),
    })),
  };
  await persistSection("media", value, path, "media");
}

/* -------------------------------------------------------------------------- */
/*  Donate                                                                    */
/* -------------------------------------------------------------------------- */

type ImpactRow = { title: string; description: string };
type FundAllocationRow = { label: string; value: string; description: string };

export async function saveDonate(formData: FormData) {
  const path = "/admin/content/donate";
  const impact = parseJsonArray<ImpactRow>(formData, "impact", path);
  const fundAllocation = parseJsonArray<FundAllocationRow>(formData, "fundAllocation", path);
  const value = {
    story: str(formData, "story"),
    impact: impact.map((i) => ({
      title: String(i.title ?? ""),
      description: String(i.description ?? ""),
    })),
    fundAllocation: fundAllocation.map((f) => ({
      label: String(f.label ?? ""),
      value: String(f.value ?? ""),
      description: String(f.description ?? ""),
    })),
  };
  await persistSection("donate", value, path, "donate");
}

/* -------------------------------------------------------------------------- */
/*  Ride date                                                                 */
/* -------------------------------------------------------------------------- */

/**
 * Saves the ride date. Converts the <input type="datetime-local"> value
 * (e.g. "2026-05-14T12:00") into a full ISO timestamp so downstream
 * countdown logic can parse it consistently.
 */
export async function saveRideDate(formData: FormData) {
  const path = "/admin/content/settings";
  const raw = str(formData, "value");
  if (!raw) {
    redirectWithMessage(path, "error", "Ride date cannot be blank.");
  }

  const parsed = new Date(raw);
  if (Number.isNaN(parsed.getTime())) {
    redirectWithMessage(path, "error", "Invalid ride date.");
  }

  await requireAuthorizedAdmin(path);
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("site_content").upsert({
    key: "ride_date",
    value: parsed.toISOString() as never,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    redirectWithMessage(path, "error", `Unable to save ride date: ${error.message}`);
  }

  updateTag(CACHE_TAGS.siteContent);
  refreshPublicSite();
  revalidatePath(path);
  redirectWithMessage(path, "success", "Saved ride date.");
}
