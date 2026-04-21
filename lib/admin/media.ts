import "server-only";

import { randomUUID } from "node:crypto";

import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export type UploadedCampaignAsset = {
  publicUrl: string;
  kind: "image" | "video";
};

export async function uploadCampaignAsset(file: File, folder: string): Promise<UploadedCampaignAsset> {
  const extension = file.name.includes(".") ? file.name.split(".").pop() : undefined;
  const fileName = `${Date.now()}-${randomUUID()}${extension ? `.${extension}` : ""}`;
  const uploadPath = `${folder}/${fileName}`;
  const supabase = createSupabaseAdminClient();
  const buffer = Buffer.from(await file.arrayBuffer());
  const kind = file.type.startsWith("video/") ? "video" : "image";

  const { error } = await supabase.storage.from("campaign-media").upload(uploadPath, buffer, {
    contentType: file.type || "application/octet-stream",
    upsert: false,
  });

  if (error) {
    throw new Error(error.message);
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("campaign-media").getPublicUrl(uploadPath);

  return { publicUrl, kind };
}

/**
 * Best-effort deletion of a previously uploaded asset in the `campaign-media`
 * bucket. Used when replacing or clearing a single-slot piece of media (e.g.
 * the live-media card) so stale files don't pile up in storage.
 *
 * Returns `true` if the bucket removal succeeded, `false` otherwise. Swallows
 * all errors — orphaned files are a cleanup issue, not a correctness one, and
 * the caller must still complete the DB write.
 */
export async function removeCampaignAsset(publicUrl: string | null | undefined): Promise<boolean> {
  if (!publicUrl) return false;
  try {
    const marker = "/campaign-media/";
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return false;
    const objectPath = publicUrl.slice(idx + marker.length);
    if (!objectPath) return false;

    const supabase = createSupabaseAdminClient();
    const { error } = await supabase.storage.from("campaign-media").remove([objectPath]);
    return !error;
  } catch {
    return false;
  }
}
