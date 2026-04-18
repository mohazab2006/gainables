export function getSupabasePublishableKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? null;
}

export function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
}

export function hasSupabaseEnv() {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && getSupabasePublishableKey());
}

export function hasSupabaseAdminEnv() {
  return hasSupabaseEnv() && Boolean(process.env.SUPABASE_SERVICE_ROLE_KEY);
}

export function hasMapboxEnv() {
  return Boolean(process.env.NEXT_PUBLIC_MAPBOX_TOKEN);
}

export function hasTrackerIngestEnv() {
  return Boolean(process.env.RIDER_TOKEN && process.env.SUPABASE_SERVICE_ROLE_KEY && process.env.NEXT_PUBLIC_SUPABASE_URL);
}

export function getTrackerReadiness() {
  return [
    {
      key: "supabase_public",
      label: "Public Supabase client",
      ready: hasSupabaseEnv(),
      detail: hasSupabaseEnv()
        ? "Public pages can read content, subscribe to realtime tables, and render live updates."
        : "Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY.",
    },
    {
      key: "supabase_admin",
      label: "Admin and Edge Function credentials",
      ready: hasSupabaseAdminEnv(),
      detail: hasSupabaseAdminEnv()
        ? "Admin writes and the ingest function can use service-role access."
        : "Set SUPABASE_SERVICE_ROLE_KEY to unlock admin writes and ingestion.",
    },
    {
      key: "mapbox",
      label: "Mapbox public token",
      ready: hasMapboxEnv(),
      detail: hasMapboxEnv()
        ? "The branded route map can render on /track."
        : "Set NEXT_PUBLIC_MAPBOX_TOKEN to replace the tracker fallback panel with the live map.",
    },
    {
      key: "rider_token",
      label: "Overland rider token",
      ready: Boolean(process.env.RIDER_TOKEN),
      detail: process.env.RIDER_TOKEN
        ? "The rider deep link and ingest endpoint can authenticate incoming position batches."
        : "Set RIDER_TOKEN before generating the final Overland setup link for ride day.",
    },
    {
      key: "site_url",
      label: "Canonical site URL",
      ready: Boolean(process.env.NEXT_PUBLIC_SITE_URL),
      detail: process.env.NEXT_PUBLIC_SITE_URL
        ? `Public callbacks and metadata resolve against ${process.env.NEXT_PUBLIC_SITE_URL}.`
        : "Set NEXT_PUBLIC_SITE_URL so auth callbacks, sitemap entries, and docs point to production.",
    },
  ] as const;
}
