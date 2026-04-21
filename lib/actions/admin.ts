"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";

import { CACHE_TAGS, PUBLIC_CACHE_TAGS } from "@/lib/cache-tags";
import { uploadCampaignAsset } from "@/lib/admin/media";
import { adminJsonContentSections, adminScalarContentSections } from "@/lib/admin/content-sections";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { getSiteContent } from "@/lib/content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { mapRidePosition, resolveTrackerSnapshot } from "@/lib/track";

const editableJsonKeys = new Set<string>(adminJsonContentSections.map((section) => section.key));
const editableScalarKeys = new Set<string>(adminScalarContentSections.map((section) => section.key));

function redirectWithMessage(path: string, type: "success" | "error", message: string) {
  const params = new URLSearchParams({ type, message });
  redirect(`${path}?${params.toString()}`);
}

function toNumber(value: FormDataEntryValue | null, fallback = 0) {
  const parsed = Number(String(value ?? ""));
  return Number.isFinite(parsed) ? parsed : fallback;
}

function toNullableString(value: FormDataEntryValue | null) {
  const text = String(value ?? "").trim();
  return text.length ? text : null;
}

function refreshPublicSite() {
  PUBLIC_CACHE_TAGS.forEach((tag) => updateTag(tag));
  revalidatePath("/");
  revalidatePath("/donate");
  revalidatePath("/track");
}

async function uploadSponsorLogo(file: File) {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const fileName = `${Date.now()}-${randomUUID()}${extension ? `.${extension}` : ""}`;
  const uploadPath = `logos/${fileName}`;
  const supabase = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());

  const { error } = await supabase.storage.from("sponsor-logos").upload(uploadPath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("sponsor-logos").getPublicUrl(uploadPath);

  return publicUrl;
}

export async function upsertSiteContentSection(formData: FormData) {
  await requireAuthorizedAdmin("/admin/content");

  const key = String(formData.get("key") ?? "");
  const path = "/admin/content";

  if (editableJsonKeys.has(key)) {
    const rawValue = String(formData.get("value") ?? "").trim();

    try {
      const parsed = JSON.parse(rawValue);
      const supabase = createSupabaseAdminClient();
      const { error } = await supabase.from("site_content").upsert({
        key,
        value: parsed,
        updated_at: new Date().toISOString(),
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Invalid JSON payload.";
      redirectWithMessage(path, "error", `Unable to save ${key}: ${message}`);
    }
  } else if (editableScalarKeys.has(key)) {
    const rawValue = String(formData.get("value") ?? "").trim();
    const value = rawValue.length ? rawValue : null;

    if (key === "tracker_status" && value && !["pre_ride", "live", "finished"].includes(value)) {
      redirectWithMessage(path, "error", "Tracker status must be pre_ride, live, or finished.");
    }

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.from("site_content").upsert({
      key,
      value,
      updated_at: new Date().toISOString(),
    });

    if (error) {
      redirectWithMessage(path, "error", `Unable to save ${key}: ${error.message}`);
    }
  } else {
    redirectWithMessage(path, "error", "Unsupported content key.");
  }

  updateTag(CACHE_TAGS.siteContent);
  refreshPublicSite();
  revalidatePath("/admin/content");
  redirectWithMessage(path, "success", `Saved ${key.replaceAll("_", " ")}.`);
}

const trackerStatusLabels: Record<"pre_ride" | "live" | "finished", string> = {
  pre_ride: "Pre-ride preview",
  live: "Live — ride day is on",
  finished: "Ride complete",
};

export async function setTrackerStatus(formData: FormData) {
  await requireAuthorizedAdmin("/admin");

  const status = String(formData.get("status") ?? "");
  if (!["pre_ride", "live", "finished"].includes(status)) {
    redirectWithMessage("/admin", "error", "Invalid ride mode.");
  }

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("site_content").upsert({
    key: "tracker_status",
    value: status,
    updated_at: new Date().toISOString(),
  });

  if (error) {
    redirectWithMessage("/admin", "error", `Unable to update ride mode: ${error.message}`);
  }

  updateTag(CACHE_TAGS.siteContent);
  refreshPublicSite();
  revalidatePath("/admin");
  revalidatePath("/admin/content");
  const label = trackerStatusLabels[status as keyof typeof trackerStatusLabels];
  redirectWithMessage("/admin", "success", `Ride mode set to ${label}.`);
}

export async function createSponsor(formData: FormData) {
  await requireAuthorizedAdmin("/admin/sponsors");

  try {
    const supabase = createSupabaseAdminClient();
    const file = formData.get("logo") as File | null;
    const logoUrl = file && file.size > 0 ? await uploadSponsorLogo(file) : null;
    const { error } = await supabase.from("sponsors").insert({
      name: String(formData.get("name") ?? "").trim(),
      tier: String(formData.get("tier") ?? "community") as "lead" | "supporting" | "community",
      link: toNullableString(formData.get("link")),
      tagline: toNullableString(formData.get("tagline")),
      sort_order: toNumber(formData.get("sortOrder"), 0),
      visible: formData.get("visible") === "on",
      logo_url: logoUrl,
    });

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to create sponsor.";
    redirectWithMessage("/admin/sponsors", "error", message);
  }

  updateTag(CACHE_TAGS.sponsors);
  refreshPublicSite();
  revalidatePath("/admin/sponsors");
  redirectWithMessage("/admin/sponsors", "success", "Sponsor created.");
}

export async function updateSponsor(formData: FormData) {
  await requireAuthorizedAdmin("/admin/sponsors");

  const id = String(formData.get("id") ?? "");

  try {
    const file = formData.get("logo") as File | null;
    const logoUrl = file && file.size > 0 ? await uploadSponsorLogo(file) : toNullableString(formData.get("existingLogoUrl"));
    const supabase = createSupabaseAdminClient();
    const { error } = await supabase
      .from("sponsors")
      .update({
        name: String(formData.get("name") ?? "").trim(),
        tier: String(formData.get("tier") ?? "community") as "lead" | "supporting" | "community",
        link: toNullableString(formData.get("link")),
        tagline: toNullableString(formData.get("tagline")),
        sort_order: toNumber(formData.get("sortOrder"), 0),
        visible: formData.get("visible") === "on",
        logo_url: logoUrl,
      })
      .eq("id", id);

    if (error) {
      throw new Error(error.message);
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to update sponsor.";
    redirectWithMessage("/admin/sponsors", "error", message);
  }

  updateTag(CACHE_TAGS.sponsors);
  refreshPublicSite();
  revalidatePath("/admin/sponsors");
  redirectWithMessage("/admin/sponsors", "success", "Sponsor updated.");
}

export async function deleteSponsor(formData: FormData) {
  await requireAuthorizedAdmin("/admin/sponsors");

  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("sponsors").delete().eq("id", id);

  if (error) {
    redirectWithMessage("/admin/sponsors", "error", `Unable to delete sponsor: ${error.message}`);
  }

  updateTag(CACHE_TAGS.sponsors);
  refreshPublicSite();
  revalidatePath("/admin/sponsors");
  redirectWithMessage("/admin/sponsors", "success", "Sponsor deleted.");
}

/**
 * Reads the latest GPS ping from `ride_positions` and projects it onto the
 * route to derive km-completed. Used by `createRideUpdate` so each feed post
 * gets stamped with "the rider was at X km when this was posted" — without
 * the admin having to type it. Returns null if no GPS data is available yet
 * (in which case the feed post is stored with km_completed = 0).
 */
async function captureKmFromLatestPosition(): Promise<{
  km: number;
  lat: number | null;
  lng: number | null;
} | null> {
  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("ride_positions")
      .select("id, recorded_at, lon, lat, accuracy_m, speed_mps, battery_pct, source, raw")
      .order("recorded_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (error || !data) return null;

    const position = mapRidePosition(data);
    const content = await getSiteContent();
    const snapshot = resolveTrackerSnapshot({
      route: content.route,
      latestPosition: position,
    });

    if (!snapshot) return null;

    return { km: snapshot.kmCompleted, lat: position.lat, lng: position.lon };
  } catch {
    return null;
  }
}

export async function createRideUpdate(formData: FormData) {
  await requireAuthorizedAdmin("/admin/updates");

  const file = formData.get("media") as File | null;
  let media: { media_url: string | null; media_kind: "image" | "video" | null } = {
    media_url: null,
    media_kind: null,
  };
  if (file && file.size > 0) {
    try {
      const uploaded = await uploadCampaignAsset(file, "ride-updates");
      media = {
        media_url: uploaded.publicUrl,
        media_kind: uploaded.kind,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload ride update media.";
      redirectWithMessage("/admin/updates", "error", message);
    }
  }

  // Auto-capture km / lat / lng from the latest GPS ping at post time, so
  // each feed card stamps the rider's exact position without admin input.
  // Tracker state itself is still GPS-only — this just immortalizes the
  // km-at-the-moment onto the individual feed entry.
  const gps = await captureKmFromLatestPosition();

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("ride_updates").insert({
    location: String(formData.get("location") ?? "").trim(),
    km_completed: gps?.km ?? 0,
    next_checkpoint: "",
    message: String(formData.get("message") ?? "").trim(),
    lat: gps?.lat ?? null,
    lng: gps?.lng ?? null,
    created_at: toNullableString(formData.get("createdAt")) ?? new Date().toISOString(),
    media_alt: toNullableString(formData.get("mediaAlt")),
    ...media,
  });

  if (error) {
    redirectWithMessage("/admin/updates", "error", `Unable to create update: ${error.message}`);
  }

  updateTag(CACHE_TAGS.rideUpdates);
  refreshPublicSite();
  revalidatePath("/admin/updates");
  redirectWithMessage("/admin/updates", "success", "Ride update posted.");
}

export async function updateRideUpdate(formData: FormData) {
  await requireAuthorizedAdmin("/admin/updates");

  const id = String(formData.get("id") ?? "");
  const file = formData.get("media") as File | null;
  const clearMedia = formData.get("clearMedia") === "on";
  let media: { media_url?: string | null; media_kind?: "image" | "video" | null } = {};
  if (clearMedia) {
    media = { media_url: null, media_kind: null };
  } else if (file && file.size > 0) {
    try {
      const uploaded = await uploadCampaignAsset(file, "ride-updates");
      media = {
        media_url: uploaded.publicUrl,
        media_kind: uploaded.kind,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unable to upload ride update media.";
      redirectWithMessage("/admin/updates", "error", message);
    }
  } else {
    media = {
      media_url: toNullableString(formData.get("existingMediaUrl")),
      media_kind: (toNullableString(formData.get("existingMediaKind")) as "image" | "video" | null) ?? null,
    };
  }

  // Feed-only edit: touch location/message/media/created_at. The km_completed
  // / lat / lng fields were auto-captured from GPS at post time and are NOT
  // part of the edit form — leave those columns untouched so re-editing a
  // post doesn't wipe the rider's captured km.
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("ride_updates")
    .update({
      location: String(formData.get("location") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      created_at: toNullableString(formData.get("createdAt")) ?? new Date().toISOString(),
      media_alt: clearMedia ? null : toNullableString(formData.get("mediaAlt")),
      ...media,
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage("/admin/updates", "error", `Unable to update ride entry: ${error.message}`);
  }

  updateTag(CACHE_TAGS.rideUpdates);
  refreshPublicSite();
  revalidatePath("/admin/updates");
  redirectWithMessage("/admin/updates", "success", "Ride update saved.");
}

export async function deleteRideUpdate(formData: FormData) {
  await requireAuthorizedAdmin("/admin/updates");

  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("ride_updates").delete().eq("id", id);

  if (error) {
    redirectWithMessage("/admin/updates", "error", `Unable to delete ride update: ${error.message}`);
  }

  updateTag(CACHE_TAGS.rideUpdates);
  refreshPublicSite();
  revalidatePath("/admin/updates");
  redirectWithMessage("/admin/updates", "success", "Ride update deleted.");
}

export async function createFaq(formData: FormData) {
  await requireAuthorizedAdmin("/admin/faqs");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("faqs").insert({
    question: String(formData.get("question") ?? "").trim(),
    answer: String(formData.get("answer") ?? "").trim(),
    sort_order: toNumber(formData.get("sortOrder"), 0),
    visible: formData.get("visible") === "on",
  });

  if (error) {
    redirectWithMessage("/admin/faqs", "error", `Unable to create FAQ: ${error.message}`);
  }

  updateTag(CACHE_TAGS.faqs);
  refreshPublicSite();
  revalidatePath("/admin/faqs");
  redirectWithMessage("/admin/faqs", "success", "FAQ created.");
}

export async function updateFaq(formData: FormData) {
  await requireAuthorizedAdmin("/admin/faqs");

  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("faqs")
    .update({
      question: String(formData.get("question") ?? "").trim(),
      answer: String(formData.get("answer") ?? "").trim(),
      sort_order: toNumber(formData.get("sortOrder"), 0),
      visible: formData.get("visible") === "on",
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage("/admin/faqs", "error", `Unable to update FAQ: ${error.message}`);
  }

  updateTag(CACHE_TAGS.faqs);
  refreshPublicSite();
  revalidatePath("/admin/faqs");
  redirectWithMessage("/admin/faqs", "success", "FAQ updated.");
}

export async function deleteFaq(formData: FormData) {
  await requireAuthorizedAdmin("/admin/faqs");

  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("faqs").delete().eq("id", id);

  if (error) {
    redirectWithMessage("/admin/faqs", "error", `Unable to delete FAQ: ${error.message}`);
  }

  updateTag(CACHE_TAGS.faqs);
  refreshPublicSite();
  revalidatePath("/admin/faqs");
  redirectWithMessage("/admin/faqs", "success", "FAQ deleted.");
}
