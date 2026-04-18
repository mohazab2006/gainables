export type ImageAsset = {
  src: string;
  alt: string;
};

export type HeroContent = {
  eyebrow: string;
  title: string;
  description: string;
  primaryImage: ImageAsset;
  sideImages: ImageAsset[];
  primaryCta: { href: string; label: string };
  secondaryCta: { href: string; label: string };
};

export type StatItem = {
  label: string;
  value: string;
  description: string;
};

export type WhyItMattersContent = {
  eyebrow: string;
  title: string;
  body: string;
  image: ImageAsset;
};

export type AboutContent = {
  eyebrow: string;
  title: string;
  body: string;
  highlights: { label: string; value: string }[];
};

export type RouteContent = {
  eyebrow: string;
  title: string;
  summary: string;
  totalDistanceKm: number;
  checkpoints: {
    stage: string;
    name: string;
    km: number;
    distanceLabel: string;
    lat: number;
    lng: number;
    note?: string;
  }[];
  polyline: { lat: number; lng: number }[];
  mapCenter: { lat: number; lng: number; zoom: number };
};

export type Pillar = {
  kicker: string;
  title: string;
  description: string;
  image: ImageAsset;
};

export type DonateContent = {
  bannerTitle: string;
  bannerBody: string;
  story: string;
  impact: { title: string; description: string }[];
  fundAllocation: { label: string; value: string; description: string }[];
};

export type CausePartnerContent = {
  eyebrow: string;
  quote: string;
  body: string;
  image: ImageAsset;
};

export type MediaContent = {
  title: string;
  body: string;
  links: { label: string; handle: string; href: string; description: string }[];
};

export type Sponsor = {
  id: string;
  name: string;
  tier: "lead" | "supporting" | "community";
  logoUrl?: string | null;
  link: string;
  tagline: string;
  visible: boolean;
  sortOrder: number;
};

export type RideUpdate = {
  id: string;
  createdAt: string;
  createdAtLabel: string;
  location: string;
  kmCompleted: number;
  nextCheckpoint: string;
  message: string;
  lat: number;
  lng: number;
};

export type RidePosition = {
  id: string;
  recordedAt: string;
  lat: number;
  lon: number;
  accuracyM: number | null;
  speedMps: number | null;
  batteryPct: number | null;
  source: string;
};

export type TrackerStatus = "pre_ride" | "live" | "finished";

export type FaqItem = {
  id: string;
  question: string;
  answer: string;
  sortOrder: number;
  visible: boolean;
};

export type SiteContent = {
  hero: HeroContent;
  stats: StatItem[];
  whyItMatters: WhyItMattersContent;
  about: AboutContent;
  route: RouteContent;
  pillars: Pillar[];
  gallery: ImageAsset[];
  causePartner: CausePartnerContent;
  media: MediaContent;
  donate: DonateContent;
  donationUrl: string;
  donationEmbedUrl: string | null;
  trackerEmbedUrl: string | null;
  trackerStatus: TrackerStatus;
  rideDate: string;
};

export const fallbackSiteContent: SiteContent = {
  hero: {
    eyebrow: "Presented by Gainables",
    title: "RIDE FOR MENTAL HEALTH",
    description:
      "This May, members of the Gainables team are cycling from Ottawa to Montreal to raise awareness and funds for mental health.",
    primaryImage: {
      src: "/images/ride-2.jpg",
      alt: "Cyclist on the open road at golden hour",
    },
    sideImages: [
      { src: "/images/ride-1.jpg", alt: "Cyclist gearing up before a long ride" },
      { src: "/images/ride-3.jpg", alt: "Quiet road stretching toward the horizon" },
      { src: "/images/cycling-team.jpg", alt: "Cycling team preparing for a group ride" },
      { src: "/images/cycling-training.jpg", alt: "Cyclist training on the road" },
    ],
    primaryCta: { href: "/donate", label: "Donate" },
    secondaryCta: { href: "/track", label: "Track the ride" },
  },
  stats: [
    { label: "Distance", value: "200 km", description: "Single-day route from Ottawa to Montreal with live checkpoints." },
    { label: "Ride date", value: "Sept 14", description: "Campaign countdown, training content, and event-day updates." },
    { label: "Community", value: "150+ donors", description: "Supporters, riders, and sponsors moving the campaign forward together." },
  ],
  whyItMatters: {
    eyebrow: "Why it matters",
    title: "Turning movement into meaning.",
    body:
      "Mental health affects people of all ages and backgrounds. Many struggle quietly with stress, burnout, anxiety, depression, and other challenges, often without enough support. This campaign is about creating a visible moment that encourages conversation, support, and shared action.",
    image: {
      src: "/images/ride-3.jpg",
      alt: "Cyclist on a quiet road with mountains in the distance",
    },
  },
  about: {
    eyebrow: "About the ride",
    title: "A community-driven initiative from Ottawa to Montreal.",
    body:
      "Ride for Mental Health is a Gainables-led initiative during Mental Health Month. Through a long-distance cycling journey from Ottawa to Montreal, the campaign aims to raise awareness, spark conversation, and generate support for mental health. This is about showing up, pushing through, and doing something meaningful for a cause that affects all of us.",
    highlights: [
      { label: "Format", value: "Single-day endurance ride" },
      { label: "Purpose", value: "Raise awareness and funds" },
      { label: "Audience", value: "Supporters, sponsors, community" },
      { label: "Workflow", value: "Editable content via Supabase" },
    ],
  },
  route: {
    eyebrow: "Route overview",
    title: "Ottawa to Montreal with visible checkpoints.",
    summary:
      "The ride represents discipline, consistency, and pushing through difficulty. The route section gives supporters a sense of scale, provides expected checkpoints, and makes the campaign feel concrete before ride day.",
    totalDistanceKm: 200,
    checkpoints: [
      { stage: "Start", name: "Ottawa", km: 0, distanceLabel: "0 km", lat: 45.4215, lng: -75.6972, note: "Campaign rollout and first telemetry lock." },
      { stage: "Checkpoint 1", name: "Casselman", km: 55, distanceLabel: "55 km", lat: 45.3154, lng: -75.0838, note: "Early nutrition and support-vehicle handoff." },
      { stage: "Checkpoint 2", name: "Hawkesbury", km: 105, distanceLabel: "105 km", lat: 45.6074, lng: -74.6058, note: "Mid-route regroup before the final push east." },
      { stage: "Finish", name: "Montreal", km: 200, distanceLabel: "200 km", lat: 45.5017, lng: -73.5673, note: "Ride complete and final supporter update." },
    ],
    polyline: [
      { lat: 45.4215, lng: -75.6972 },
      { lat: 45.3154, lng: -75.0838 },
      { lat: 45.6074, lng: -74.6058 },
      { lat: 45.5017, lng: -73.5673 },
    ],
    mapCenter: { lat: 45.49, lng: -74.78, zoom: 7.1 },
  },
  pillars: [
    {
      kicker: "Raise awareness",
      title: "Make support visible in public.",
      description: "Turn the route into a public narrative people can follow, share, and support with context.",
      image: { src: "/images/ride-1.jpg", alt: "Cyclists grouped together before a ride" },
    },
    {
      kicker: "Support mental health",
      title: "Direct momentum toward meaningful support.",
      description: "Keep the donation path visible and friction-light across the homepage, tracker, and story pages.",
      image: { src: "/images/ride-3.jpg", alt: "Cyclist training solo on a road ride" },
    },
    {
      kicker: "Bring people together",
      title: "Give supporters, sponsors, and riders a shared moment.",
      description: "Give partners visibility and give supporters reasons to stay engaged before, during, and after the event.",
      image: { src: "/images/ride-2.jpg", alt: "Cyclists in motion during an organized ride" },
    },
  ],
  gallery: [
    { src: "/images/ride-2.jpg", alt: "Cyclist on the road at golden hour" },
    { src: "/images/cycling-team.jpg", alt: "Team photo before a cycling session" },
    { src: "/images/ride-1.jpg", alt: "Cyclist preparing for a long ride" },
    { src: "/images/cycling-training.jpg", alt: "Training ride in progress" },
    { src: "/images/ride-3.jpg", alt: "Open road stretching to the horizon" },
    { src: "/images/hero-cycling.jpg", alt: "Cyclist leading the route" },
  ],
  causePartner: {
    eyebrow: "Supporting mental health",
    quote:
      "Funds raised through this campaign support mental health initiatives and services through our fundraising efforts.",
    body:
      "This section stays editable so Gainables can safely publish a confirmed partner name later. Until then, the language remains public-safe and focused on where funds are intended to go.",
    image: { src: "/images/ride-2.jpg", alt: "Cycling route image used for cause partner section" },
  },
  media: {
    title: "Follow the journey across training, preparation, and ride-day moments.",
    body:
      "The campaign is being documented across social media through training, behind-the-scenes moments, and the ride itself. Media references should stay flexible and only include logos when coverage or approval is confirmed.",
    links: [
      {
        label: "Instagram",
        handle: "rideformentalhealth",
        href: "https://instagram.com",
        description: "Primary channel for training moments, campaign updates, and ride-day stories.",
      },
      {
        label: "TikTok",
        handle: "gainables",
        href: "https://tiktok.com",
        description: "Short-form video content and campaign storytelling.",
      },
      {
        label: "Media contact",
        handle: "media@gainables.com",
        href: "mailto:media@gainables.com",
        description: "Press requests, campaign coverage, and partner outreach.",
      },
    ],
  },
  donate: {
    bannerTitle: "Put funding where the conversation is already moving.",
    bannerBody:
      "Every contribution helps drive awareness and support for mental health. Follow the ride, share the campaign, and donate to help make a meaningful impact.",
    story:
      "This page exists even if donations happen through an external platform. It gives the campaign a clean place to explain the cause, clarify where funds are going, and direct people to the final donation flow.",
    impact: [
      { title: "Care access", description: "Support programs, counselling access, or community-led mental health initiatives." },
      { title: "Campaign reach", description: "Increase visibility so the ride keeps the conversation active beyond ride day." },
      { title: "Community support", description: "Equip sponsors and supporters with a cause they can stand behind publicly." },
    ],
    fundAllocation: [
      {
        label: "Direct support",
        value: "Primary",
        description: "Funds are intended to support mental health services, programs, and community support efforts.",
      },
      {
        label: "Campaign logistics",
        value: "Secondary",
        description: "A polished, trackable campaign experience helps supporters follow the ride and keeps sponsors engaged.",
      },
      {
        label: "Sponsor match",
        value: "Optional",
        description: "The layout leaves room for a sponsor match block if that becomes part of the fundraising strategy.",
      },
    ],
  },
  donationUrl: "https://example.com/donate",
  donationEmbedUrl: null,
  trackerEmbedUrl: null,
  trackerStatus: "pre_ride",
  rideDate: "2026-09-14T07:00:00.000Z",
};

export const fallbackSponsors: Sponsor[] = [
  {
    id: "lead-gainables",
    name: "Gainables",
    tier: "lead",
    logoUrl: null,
    link: "https://gainables.ca",
    tagline: "Campaign lead and community-first organizer.",
    visible: true,
    sortOrder: 1,
  },
  {
    id: "supporting-health-wellness",
    name: "Health & Wellness Partner",
    tier: "supporting",
    logoUrl: null,
    link: "https://example.com",
    tagline: "Supporting the campaign’s visibility and reach.",
    visible: true,
    sortOrder: 2,
  },
  {
    id: "community-cycle-club",
    name: "Community Cycling Partner",
    tier: "community",
    logoUrl: null,
    link: "https://example.com",
    tagline: "Grassroots support and local ride-day momentum.",
    visible: true,
    sortOrder: 3,
  },
];

export const fallbackRideUpdates: RideUpdate[] = [
  {
    id: "update-1",
    createdAt: "2026-09-14T08:15:00.000Z",
    createdAtLabel: "8:15 AM",
    location: "Casselman checkpoint",
    kmCompleted: 55,
    nextCheckpoint: "Hawkesbury",
    message: "Early pace is steady and the support crew is set for the next handoff.",
    lat: 45.3154,
    lng: -75.0838,
  },
  {
    id: "update-2",
    createdAt: "2026-09-14T11:40:00.000Z",
    createdAtLabel: "11:40 AM",
    location: "Hawkesbury riverside stop",
    kmCompleted: 108,
    nextCheckpoint: "Montreal finish line",
    message: "Midday regroup complete. The ride is heading into the final push toward Montreal.",
    lat: 45.6074,
    lng: -74.6058,
  },
];

export const fallbackRidePositions: RidePosition[] = [
  {
    id: "position-1",
    recordedAt: "2026-09-14T08:10:00.000Z",
    lat: 45.354,
    lon: -75.188,
    accuracyM: 9,
    speedMps: 7.1,
    batteryPct: 97,
    source: "overland",
  },
  {
    id: "position-2",
    recordedAt: "2026-09-14T10:25:00.000Z",
    lat: 45.497,
    lon: -74.804,
    accuracyM: 8,
    speedMps: 7.8,
    batteryPct: 88,
    source: "overland",
  },
  {
    id: "position-3",
    recordedAt: "2026-09-14T12:05:00.000Z",
    lat: 45.6074,
    lon: -74.6058,
    accuracyM: 11,
    speedMps: 6.4,
    batteryPct: 79,
    source: "overland",
  },
];

export const fallbackFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "Where do donations go?",
    answer:
      "Funds raised through the campaign support mental health initiatives and services through the campaign’s fundraising efforts and confirmed partner relationships.",
    sortOrder: 1,
    visible: true,
  },
  {
    id: "faq-2",
    question: "Can supporters follow the ride live?",
    answer:
      "Yes. The tracker page supports a live Mapbox route view, a manual status card, and an iframe fallback for services such as Strava Beacon or Garmin LiveTrack.",
    sortOrder: 2,
    visible: true,
  },
  {
    id: "faq-3",
    question: "How are sponsors managed?",
    answer:
      "Sponsors are grouped into lead, supporting, and community tiers with editable records for names, logos, ordering, and links.",
    sortOrder: 3,
    visible: true,
  },
];
