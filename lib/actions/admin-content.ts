"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS, PUBLIC_CACHE_TAGS } from "@/lib/cache-tags";
import { removeCampaignAsset, uploadCampaignAsset } from "@/lib/admin/media";
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
  const backgroundFile = formData.get("backgroundMedia") as File | null;
  const posterFile = formData.get("backgroundPoster") as File | null;
  const clearBackground = formData.get("clearBackground") === "on";
  const existingKind = str(formData, "existingBackgroundKind");
  const existingUrl = str(formData, "existingBackgroundUrl");
  const existingPosterUrl = str(formData, "existingBackgroundPosterUrl");
  let backgroundMedia: {
    kind: "image" | "video";
    url: string;
    alt?: string;
    posterUrl?: string;
  } | null = clearBackground
    ? null
    : existingKind && existingUrl
      ? {
          kind: existingKind === "video" ? "video" : "image",
          url: existingUrl,
          alt: str(formData, "backgroundAlt") || undefined,
          posterUrl: existingPosterUrl || undefined,
        }
      : null;

  try {
    if (backgroundFile && backgroundFile.size > 0) {
      const uploaded = await uploadCampaignAsset(backgroundFile, "hero");
      backgroundMedia = {
        kind: uploaded.kind,
        url: uploaded.publicUrl,
        alt: str(formData, "backgroundAlt") || undefined,
        posterUrl: uploaded.kind === "video" ? existingPosterUrl || undefined : undefined,
      };
    }
    if (posterFile && posterFile.size > 0) {
      const uploadedPoster = await uploadCampaignAsset(posterFile, "hero-posters");
      if (backgroundMedia) {
        backgroundMedia.posterUrl = uploadedPoster.publicUrl;
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to upload hero media.";
    redirectWithMessage(path, "error", message);
  }

  const value = {
    eyebrow: str(formData, "eyebrow"),
    description: str(formData, "description"),
    backgroundMedia,
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
type RouteCheckpointRow = {
  stage: string;
  name: string;
  km: string;
  distanceLabel: string;
  lat: string;
  lng: string;
  note: string;
};
type RoutePointRow = { lat: string; lng: string };

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
/*  Live media                                                                */
/* -------------------------------------------------------------------------- */

/**
 * Saves the single featured live-media item shown under the tracker status
 * card. Only one slot exists — uploading a new file replaces the previous
 * one and removes the old asset from storage.
 *
 * "Clear" is modeled as a row deletion rather than a null upsert because the
 * `site_content.value` JSONB column is `NOT NULL`; upserting `null` there
 * raises `23502`. Public code treats a missing row the same as "no live
 * media", so deletion is the correct no-op.
 */
export async function saveLiveMedia(formData: FormData) {
  const path = "/admin/content/live-media";
  await requireAuthorizedAdmin(path);

  const clear = formData.get("clear") === "on";
  const file = formData.get("media") as File | null;
  const caption = str(formData, "caption");
  const existingUrl = str(formData, "existingUrl");
  const existingKind = str(formData, "existingKind");
  const existingPosterUrl = str(formData, "existingPosterUrl");

  type Payload = {
    kind: "image" | "video";
    url: string;
    caption?: string;
    posterUrl?: string;
    updatedAt?: string;
  };
  let value: Payload | null = null;

  if (clear) {
    // Remove the on-disk asset first; ignore failure, the DB delete is what
    // drives the public UI.
    await removeCampaignAsset(existingUrl);
    value = null;
  } else if (file && file.size > 0) {
    try {
      const uploaded = await uploadCampaignAsset(file, "live-media");
      // Best-effort cleanup of the replaced file.
      if (existingUrl && existingUrl !== uploaded.publicUrl) {
        await removeCampaignAsset(existingUrl);
      }
      value = {
        kind: uploaded.kind,
        url: uploaded.publicUrl,
        caption: caption || undefined,
        updatedAt: new Date().toISOString(),
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload media.";
      redirectWithMessage(path, "error", message);
    }
  } else if (existingUrl && (existingKind === "image" || existingKind === "video")) {
    // Caption-only edit on an existing item.
    value = {
      kind: existingKind,
      url: existingUrl,
      caption: caption || undefined,
      posterUrl: existingPosterUrl || undefined,
      updatedAt: new Date().toISOString(),
    };
  } else {
    redirectWithMessage(path, "error", "Upload a photo or video to feature.");
  }

  const supabase = createSupabaseAdminClient();

  if (value === null) {
    const { error } = await supabase.from("site_content").delete().eq("key", "live_media");
    if (error) {
      redirectWithMessage(path, "error", `Unable to clear live media: ${error.message}`);
    }
    updateTag(CACHE_TAGS.siteContent);
    refreshPublicSite();
    revalidatePath(path);
    redirectWithMessage(path, "success", "Cleared live media.");
  }

  await persistSection("live_media", value, path, "live media");
}

/* -------------------------------------------------------------------------- */
/*  Route                                                                     */
/* -------------------------------------------------------------------------- */

export async function saveRoute(formData: FormData) {
  const path = "/admin/content/route";
  const checkpoints = parseJsonArray<RouteCheckpointRow>(formData, "checkpoints", path);
  const polyline = parseJsonArray<RoutePointRow>(formData, "polyline", path);
  const value = {
    totalDistanceKm: Number(str(formData, "totalDistanceKm") || "0"),
    mapCenter: {
      lat: Number(str(formData, "mapCenterLat") || "0"),
      lng: Number(str(formData, "mapCenterLng") || "0"),
      zoom: Number(str(formData, "mapCenterZoom") || "0"),
    },
    checkpoints: checkpoints.map((checkpoint, index) => ({
      stage: String(checkpoint.stage ?? "").trim() || `Checkpoint ${index + 1}`,
      name: String(checkpoint.name ?? "").trim() || `Checkpoint ${index + 1}`,
      km: Number(checkpoint.km ?? 0),
      distanceLabel: String(checkpoint.distanceLabel ?? "").trim() || `${Number(checkpoint.km ?? 0)} km`,
      lat: Number(checkpoint.lat ?? 0),
      lng: Number(checkpoint.lng ?? 0),
      note: String(checkpoint.note ?? "").trim() || undefined,
    })),
    polyline: polyline.map((point) => ({
      lat: Number(point.lat ?? 0),
      lng: Number(point.lng ?? 0),
    })),
  };
  await persistSection("route", value, path, "route");
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
