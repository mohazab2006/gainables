import "server-only";

import { cache } from "react";

import { hasSupabaseEnv } from "@/lib/env";
import {
  fallbackFaqs,
  fallbackRideUpdates,
  fallbackSiteContent,
  fallbackSponsors,
  type FaqItem,
  type RideUpdate,
  type SiteContent,
  type Sponsor,
} from "@/lib/fallback-content";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const getSiteContent = cache(async (): Promise<SiteContent> => {
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
    };
  } catch {
    return fallbackSiteContent;
  }
});

export const getSponsors = cache(async (): Promise<Sponsor[]> => {
  if (!hasSupabaseEnv()) {
    return fallbackSponsors.filter((sponsor) => sponsor.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }

  try {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from("sponsors")
      .select("id, name, tier, link, sort_order, visible, tagline")
      .eq("visible", true)
      .order("sort_order", { ascending: true });

    if (error || !data?.length) {
      return fallbackSponsors.filter((sponsor) => sponsor.visible).sort((a, b) => a.sortOrder - b.sortOrder);
    }

    return data.map((row) => ({
      id: row.id,
      name: row.name,
      tier: row.tier,
      link: row.link ?? "#",
      tagline: row.tagline ?? "Campaign sponsor",
      visible: row.visible,
      sortOrder: row.sort_order,
    }));
  } catch {
    return fallbackSponsors.filter((sponsor) => sponsor.visible).sort((a, b) => a.sortOrder - b.sortOrder);
  }
});

export const getRideUpdates = cache(async (): Promise<RideUpdate[]> => {
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
      id: row.id,
      createdAt: row.created_at,
      createdAtLabel: new Intl.DateTimeFormat("en-CA", {
        hour: "numeric",
        minute: "2-digit",
      }).format(new Date(row.created_at)),
      location: row.location,
      kmCompleted: row.km_completed,
      nextCheckpoint: row.next_checkpoint,
      message: row.message,
      lat: row.lat ?? fallbackRideUpdates[0].lat,
      lng: row.lng ?? fallbackRideUpdates[0].lng,
    }));
  } catch {
    return [...fallbackRideUpdates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
});

export const getLatestRideUpdate = cache(async (): Promise<RideUpdate> => {
  const [latest] = await getRideUpdates();
  return latest;
});

export const getFaqs = cache(async (): Promise<FaqItem[]> => {
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
});

function readValue<T>(map: Map<string, unknown>, key: string, fallback: T): T {
  return (map.get(key) as T | undefined) ?? fallback;
}
