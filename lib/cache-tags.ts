export const CACHE_TAGS = {
  faqs: "faqs",
  ridePositions: "ride-positions",
  rideUpdates: "ride-updates",
  siteContent: "site-content",
  sponsors: "sponsors",
  subscribers: "subscribers",
} as const;

export const PUBLIC_CACHE_TAGS = [
  CACHE_TAGS.siteContent,
  CACHE_TAGS.sponsors,
  CACHE_TAGS.rideUpdates,
  CACHE_TAGS.ridePositions,
  CACHE_TAGS.faqs,
] as const;
