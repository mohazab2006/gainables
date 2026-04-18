import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://gainables.example";

  return ["", "/donate", "/track", "/updates"].map((path) => ({
    url: `${baseUrl}${path}`,
    changeFrequency: path === "/track" ? "hourly" : "weekly",
    priority: path === "" ? 1 : 0.8,
  }));
}
