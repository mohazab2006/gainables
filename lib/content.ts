import "server-only";

import { hasSupabaseEnv } from "@/lib/env";
import {
  fallbackFaqs,
  fallbackRidePositions,
  fallbackRideUpdates,
  fallbackSiteContent,
  fallbackSponsors,
  type FaqItem,
  type RidePosition,
  type RideUpdate,
  type RouteContent,
  type SiteContent,
  type Sponsor,
} from "@/lib/fallback-content";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { createSupabasePublicClient } from "@/lib/supabase/public";
import { mapRidePosition, mapRideUpdate } from "@/lib/track";

export async function getSiteContent(): Promise<SiteContent> {
  return getCachedSiteContent();
}

async function getCachedSiteContent(): Promise<SiteContent> {
  if (!hasSupabaseEnv()) {
    return fallbackSiteContent;
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase.from("site_content").select("key, value");

    if (error || !data?.length) {
      return fallbackSiteContent;
    }

    const map = new Map(data.map((row) => [row.key, row.value]));

    return {
      ...fallbackSiteContent,
      hero: readValue(map, "hero", fallbackSiteContent.hero),
      stats: readValue(map, "stats", fallbackSiteContent.stats),
      whyItMatters: readValue(map, "why_it_matters", fallbackSiteContent.whyItMatters),
      about: readValue(map, "about", fallbackSiteContent.about),
      route: normalizeRouteContent(readValue(map, "route", fallbackSiteContent.route), fallbackSiteContent.route),
      pillars: readValue(map, "pillars", fallbackSiteContent.pillars),
      gallery: readValue(map, "gallery", fallbackSiteContent.gallery),
      causePartner: readValue(map, "cause_partner", fallbackSiteContent.causePartner),
      media: readValue(map, "media", fallbackSiteContent.media),
      donate: readValue(map, "donate", fallbackSiteContent.donate),
      donationTotals: readValue(map, "donation_totals", fallbackSiteContent.donationTotals),
      donationUrl: readValue(map, "donation_url", fallbackSiteContent.donationUrl),
      donationEmbedUrl: readValue(map, "donation_embed_url", fallbackSiteContent.donationEmbedUrl),
      trackerEmbedUrl: readValue(map, "tracker_embed_url", fallbackSiteContent.trackerEmbedUrl),
      trackerStatus: readValue(map, "tracker_status", fallbackSiteContent.trackerStatus),
      rideDate: readValue(map, "ride_date", fallbackSiteContent.rideDate),
    };
  } catch {
    return fallbackSiteContent;
  }
}

export async function getSponsors(): Promise<Sponsor[]> {
  return getCachedSponsors();
}

async function getCachedSponsors(): Promise<Sponsor[]> {
  if (!hasSupabaseEnv()) {
    return fallbackSponsors.filter((sponsor) => sponsor.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("sponsors")
      .select("id, name, tier, logo_url, link, sort_order, visible, tagline")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return fallbackSponsors.filter((sponsor) => sponsor.visible).sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      tier: row.tier,
      logoUrl: row.logo_url,
      link: row.link ?? "#",
      tagline: row.tagline ?? "Campaign sponsor",
      visible: row.visible,
      sortOrder: row.sort_order,
    }));
  } catch {
    return fallbackSponsors.filter((sponsor) => sponsor.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export async function getAllSponsors(): Promise<Sponsor[]> {
  return getCachedAllSponsors();
}

async function getCachedAllSponsors(): Promise<Sponsor[]> {
  try {
    if (!hasSupabaseEnv()) {
      return [...fallbackSponsors].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("sponsors")
      .select("id, name, tier, logo_url, link, sort_order, visible, tagline")
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return [...fallbackSponsors].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      tier: row.tier,
      logoUrl: row.logo_url,
      link: row.link ?? "#",
      tagline: row.tagline ?? "Campaign sponsor",
      visible: row.visible,
      sortOrder: row.sort_order,
    }));
  } catch {
    return [...fallbackSponsors].sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export async function getRideUpdates(): Promise<RideUpdate[]> {
  return getCachedRideUpdates();
}

async function getCachedRideUpdates(): Promise<RideUpdate[]> {
  if (!hasSupabaseEnv()) {
    return [...fallbackRideUpdates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("ride_updates")
      .select("id, created_at, location, km_completed, next_checkpoint, message, lat, lng")
      .order("created_at", { ascending: false });

    if (error || !data?.length) {
      return [...fallbackRideUpdates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    }

    return data.map((row) => ({
      ...mapRideUpdate(row, fallbackRideUpdates[0]),
    }));
  } catch {
    return [...fallbackRideUpdates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}

export async function getLatestRideUpdate(): Promise<RideUpdate> {
  const [latest] = await getRideUpdates();
  return latest;
}

export async function getRidePositions(limit = 80): Promise<RidePosition[]> {
  return getCachedRidePositions(limit);
}

async function getCachedRidePositions(limit = 80): Promise<RidePosition[]> {
  if (!hasSupabaseEnv()) {
    return [...fallbackRidePositions].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).slice(-limit);
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("ride_positions")
      .select("id, recorded_at, lon, lat, accuracy_m, speed_mps, battery_pct, source, raw")
      .order("recorded_at", { ascending: false })
      .limit(limit);

    if (error || !data?.length) {
      return [...fallbackRidePositions].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).slice(-limit);
    }

    return data
      .map((row) => mapRidePosition(row))
      .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt));
  } catch {
    return [...fallbackRidePositions].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).slice(-limit);
  }
}

export async function getLatestRidePosition(): Promise<RidePosition | null> {
  const positions = await getRidePositions(1);
  return positions.at(-1) ?? null;
}

export async function getFaqs(): Promise<FaqItem[]> {
  return getCachedFaqs();
}

async function getCachedFaqs(): Promise<FaqItem[]> {
  if (!hasSupabaseEnv()) {
    return fallbackFaqs.filter((faq) => faq.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const supabase = createSupabasePublicClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, sort_order, visible")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return fallbackFaqs.filter((faq) => faq.visible).sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return data.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      sortOrder: row.sort_order,
      visible: row.visible,
    }));
  } catch {
    return fallbackFaqs.filter((faq) => faq.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export async function getAllFaqs(): Promise<FaqItem[]> {
  return getCachedAllFaqs();
}

async function getCachedAllFaqs(): Promise<FaqItem[]> {
  try {
    if (!hasSupabaseEnv()) {
      return [...fallbackFaqs].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("faqs")
      .select("id, question, answer, sort_order, visible")
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return [...fallbackFaqs].sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return data.map((row) => ({
      id: row.id,
      question: row.question,
      answer: row.answer,
      sortOrder: row.sort_order,
      visible: row.visible,
    }));
  } catch {
    return [...fallbackFaqs].sort((a, b) => a.sortOrder - b.sortOrder);
  }
}

export type SubscriberRecord = {
  id: string;
  email: string;
  source: string | null;
  createdAt: string;
};

export async function getSubscribers(limit = 200): Promise<SubscriberRecord[]> {
  return getCachedSubscribers(limit);
}

async function getCachedSubscribers(limit = 200): Promise<SubscriberRecord[]> {
  if (!hasSupabaseEnv()) {
    return [];
  }

  try {
    const supabase = createSupabaseAdminClient();
    const { data, error } = await supabase
      .from("subscribers")
      .select("id, email, source, created_at")
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error || !data) {
      return [];
    }

    return data.map((row) => ({
      id: row.id,
      email: row.email,
      source: row.source,
      createdAt: row.created_at,
    }));
  } catch {
    return [];
  }
}

function readValue<T>(map: Map<string, unknown>, key: string, fallback: T): T {
  return (map.get(key) as T | undefined) ?? fallback;
}

function normalizeRouteContent(input: unknown, fallback: RouteContent): RouteContent {
  if (!input || typeof input !== "object") {
    return fallback;
  }

  type LegacyCheckpoint = Partial<RouteContent["checkpoints"][number]> & {
    distance?: string;
  };

  const route = input as Partial<RouteContent> & {
    checkpoints?: LegacyCheckpoint[];
  };

  const fallbackCheckpoints = fallback.checkpoints;
  const checkpoints = Array.isArray(route.checkpoints)
    ? route.checkpoints.map((checkpoint, index) => {
        const fallbackCheckpoint = fallbackCheckpoints[index] ?? fallbackCheckpoints.at(-1) ?? fallbackCheckpoints[0];
        const checkpointValue = checkpoint as LegacyCheckpoint;
        const km =
          typeof checkpoint.km === "number" && Number.isFinite(checkpoint.km)
            ? checkpoint.km
            : parseDistanceLabel(checkpointValue.distance ?? checkpoint.distanceLabel ?? fallbackCheckpoint?.distanceLabel ?? "0 km");

        return {
          stage: checkpoint.stage ?? fallbackCheckpoint?.stage ?? `Checkpoint ${index + 1}`,
          name: checkpoint.name ?? fallbackCheckpoint?.name ?? `Checkpoint ${index + 1}`,
          km,
          distanceLabel: checkpoint.distanceLabel ?? checkpointValue.distance ?? `${km} km`,
          lat:
            typeof checkpoint.lat === "number" && Number.isFinite(checkpoint.lat)
              ? checkpoint.lat
              : fallbackCheckpoint?.lat ?? fallback.mapCenter.lat,
          lng:
            typeof checkpoint.lng === "number" && Number.isFinite(checkpoint.lng)
              ? checkpoint.lng
              : fallbackCheckpoint?.lng ?? fallback.mapCenter.lng,
          note: checkpoint.note ?? fallbackCheckpoint?.note,
        };
      })
    : fallbackCheckpoints;

  return {
    ...fallback,
    ...route,
    checkpoints,
  };
}

function parseDistanceLabel(value: string) {
  const numeric = Number.parseFloat(value.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}
