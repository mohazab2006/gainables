export const adminJsonContentSections = [
  {
    key: "hero",
    title: "Hero",
    description: "Homepage hero eyebrow + description.",
  },
  {
    key: "why_it_matters",
    title: "Why it matters",
    description: "Mission block — title and body paragraph.",
  },
  {
    key: "route",
    title: "Route",
    description: "Total distance, checkpoints, polyline, and map centre.",
  },
  {
    key: "media",
    title: "Media",
    description: "Contact block body copy and social links.",
  },
  {
    key: "donate",
    title: "Donate",
    description: "Story paragraph, impact tiles, and allocation rows on /donate.",
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
