export const adminJsonContentSections = [
  {
    key: "hero",
    title: "Hero",
    description: "Homepage hero copy, CTAs, and image references.",
  },
  {
    key: "stats",
    title: "Stats",
    description: "Top-line campaign metrics shown near the hero.",
  },
  {
    key: "why_it_matters",
    title: "Why it matters",
    description: "Context block explaining the mission behind the ride.",
  },
  {
    key: "about",
    title: "About",
    description: "Campaign overview and supporting highlights.",
  },
  {
    key: "route",
    title: "Route",
    description: "Route summary, checkpoints, and map data.",
  },
  {
    key: "pillars",
    title: "Pillars",
    description: "Core campaign message cards and imagery.",
  },
  {
    key: "gallery",
    title: "Gallery",
    description: "Image assets displayed across the public experience.",
  },
  {
    key: "cause_partner",
    title: "Cause partner",
    description: "Fundraising partner messaging and supporting image.",
  },
  {
    key: "media",
    title: "Media",
    description: "Social links, media copy, and contact information.",
  },
  {
    key: "donate",
    title: "Donate",
    description: "Donation narrative, impact blocks, and allocation details.",
  },
] as const;

export const adminScalarContentSections = [
  {
    key: "donation_url",
    title: "Donation URL",
    description: "Primary outbound donation destination.",
  },
  {
    key: "donation_embed_url",
    title: "Donation embed URL",
    description: "Optional iframe source for an embedded donation form.",
  },
  {
    key: "tracker_embed_url",
    title: "Tracker embed URL",
    description: "Optional iframe source for Strava Beacon, Garmin LiveTrack, or a custom tracker.",
  },
  {
    key: "tracker_status",
    title: "Tracker status",
    description: "Tracker lifecycle state: pre_ride, live, or finished.",
  },
  {
    key: "ride_date",
    title: "Ride date",
    description: "ISO timestamp used for countdown and ride-day activation.",
  },
] as const;

export type AdminJsonContentKey = (typeof adminJsonContentSections)[number]["key"];
export type AdminScalarContentKey = (typeof adminScalarContentSections)[number]["key"];
