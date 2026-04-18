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
  type SiteContent,
  type Sponsor,
} from "@/lib/fallback-content";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { mapRidePosition, mapRideUpdate } from "@/lib/track";

export async function getSiteContent(): Promise<SiteContent> {
  if (!hasSupabaseEnv()) {
    return fallbackSiteContent;
  }

  try {
    const supabase = await createSupabaseServerClient();
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
      route: readValue(map, "route", fallbackSiteContent.route),
      pillars: readValue(map, "pillars", fallbackSiteContent.pillars),
      gallery: readValue(map, "gallery", fallbackSiteContent.gallery),
      causePartner: readValue(map, "cause_partner", fallbackSiteContent.causePartner),
      media: readValue(map, "media", fallbackSiteContent.media),
      donate: readValue(map, "donate", fallbackSiteContent.donate),
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
  if (!hasSupabaseEnv()) {
    return fallbackSponsors.filter((sponsor) => sponsor.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const supabase = await createSupabaseServerClient();
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
  if (!hasSupabaseEnv()) {
    return [...fallbackSponsors].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const supabase = await createSupabaseServerClient();
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
  if (!hasSupabaseEnv()) {
    return [...fallbackRideUpdates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }

  try {
    const supabase = await createSupabaseServerClient();
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
  if (!hasSupabaseEnv()) {
    return [...fallbackRidePositions].sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)).slice(-limit);
  }

  try {
    const supabase = await createSupabaseServerClient();
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
  if (!hasSupabaseEnv()) {
    return fallbackFaqs.filter((faq) => faq.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const supabase = await createSupabaseServerClient();
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
  if (!hasSupabaseEnv()) {
    return [...fallbackFaqs].sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const supabase = await createSupabaseServerClient();
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

function readValue<T>(map: Map<string, unknown>, key: string, fallback: T): T {
  return (map.get(key) as T | undefined) ?? fallback;
}
