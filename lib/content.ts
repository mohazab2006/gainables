import "server-only";

import { cache } from "react";

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

export const getSiteContent = cache(async (): Promise<SiteContent> => {
  return fallbackSiteContent;
});

export const getSponsors = cache(async (): Promise<Sponsor[]> => {
  return fallbackSponsors.filter((sponsor) => sponsor.visible).sort((a, b) => a.sortOrder - b.sortOrder);
});

export const getRideUpdates = cache(async (): Promise<RideUpdate[]> => {
  return [...fallbackRideUpdates].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
});

export const getLatestRideUpdate = cache(async (): Promise<RideUpdate> => {
  const [latest] = await getRideUpdates();
  return latest;
});

export const getFaqs = cache(async (): Promise<FaqItem[]> => {
  return fallbackFaqs.filter((faq) => faq.visible).sort((a, b) => a.sortOrder - b.sortOrder);
});
