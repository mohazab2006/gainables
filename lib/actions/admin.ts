"use server";

import { randomUUID } from "node:crypto";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { adminJsonContentSections, adminScalarContentSections } from "@/lib/admin/content-sections";
import { requireAuthorizedAdmin } from "@/lib/admin/guards";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

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

  revalidatePath("/");
  revalidatePath("/donate");
  revalidatePath("/track");
  revalidatePath("/updates");
  revalidatePath("/admin/content");
  redirectWithMessage(path, "success", `Saved ${key.replaceAll("_", " ")}.`);
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

  revalidatePath("/");
  revalidatePath("/track");
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

  revalidatePath("/");
  revalidatePath("/track");
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

  revalidatePath("/");
  revalidatePath("/track");
  revalidatePath("/admin/sponsors");
  redirectWithMessage("/admin/sponsors", "success", "Sponsor deleted.");
}

export async function createRideUpdate(formData: FormData) {
  await requireAuthorizedAdmin("/admin/updates");

  const supabase = createSupabaseAdminClient();
  const { error } = await supabase.from("ride_updates").insert({
    location: String(formData.get("location") ?? "").trim(),
    km_completed: toNumber(formData.get("kmCompleted"), 0),
    next_checkpoint: String(formData.get("nextCheckpoint") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
    lat: toNullableString(formData.get("lat")) ? toNumber(formData.get("lat")) : null,
    lng: toNullableString(formData.get("lng")) ? toNumber(formData.get("lng")) : null,
    created_at: toNullableString(formData.get("createdAt")) ?? new Date().toISOString(),
  });

  if (error) {
    redirectWithMessage("/admin/updates", "error", `Unable to create update: ${error.message}`);
  }

  revalidatePath("/track");
  revalidatePath("/updates");
  revalidatePath("/admin/updates");
  redirectWithMessage("/admin/updates", "success", "Ride update posted.");
}

export async function updateRideUpdate(formData: FormData) {
  await requireAuthorizedAdmin("/admin/updates");

  const id = String(formData.get("id") ?? "");
  const supabase = createSupabaseAdminClient();
  const { error } = await supabase
    .from("ride_updates")
    .update({
      location: String(formData.get("location") ?? "").trim(),
      km_completed: toNumber(formData.get("kmCompleted"), 0),
      next_checkpoint: String(formData.get("nextCheckpoint") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
      lat: toNullableString(formData.get("lat")) ? toNumber(formData.get("lat")) : null,
      lng: toNullableString(formData.get("lng")) ? toNumber(formData.get("lng")) : null,
      created_at: toNullableString(formData.get("createdAt")) ?? new Date().toISOString(),
    })
    .eq("id", id);

  if (error) {
    redirectWithMessage("/admin/updates", "error", `Unable to update ride entry: ${error.message}`);
  }

  revalidatePath("/track");
  revalidatePath("/updates");
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

  revalidatePath("/track");
  revalidatePath("/updates");
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

  revalidatePath("/");
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

  revalidatePath("/");
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

  revalidatePath("/");
  revalidatePath("/admin/faqs");
  redirectWithMessage("/admin/faqs", "success", "FAQ deleted.");
}
