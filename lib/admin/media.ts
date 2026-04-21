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
