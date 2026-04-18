import type { MetadataRoute } from "next";

import { getSiteUrl } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = getSiteUrl();

  return ["", "/donate", "/track", "/updates"].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "/track" ? "hourly" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
