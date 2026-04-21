export type HeroContent = {
  eyebrow: string;
  description: string;
  backgroundMedia?: {
    kind: "image" | "video";
    url: string;
    alt?: string;
    posterUrl?: string;
  } | null;
};

export type WhyItMattersContent = {
  title: string;
  body: string;
};

export type RouteContent = {
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

export type DonateContent = {
  story: string;
  impact: { title: string; description: string }[];
  fundAllocation: { label: string; value: string; description: string }[];
};

export type MediaContent = {
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
  mediaUrl?: string | null;
  mediaKind?: "image" | "video" | null;
  mediaAlt?: string | null;
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

export type DonationTotals = {
  raisedAmount: number;
  goalAmount: number;
  donorCount: number;
  currency: string;
};

export type SiteContent = {
  hero: HeroContent;
  whyItMatters: WhyItMattersContent;
  route: RouteContent;
  media: MediaContent;
  donate: DonateContent;
  donationTotals: DonationTotals;
  donationUrl: string;
  donationEmbedUrl: string | null;
  trackerStatus: TrackerStatus;
  rideDate: string;
};

export const fallbackSiteContent: SiteContent = {
  hero: {
    eyebrow: "Presented by Gainables",
    description:
      "A community-driven initiative from Gainables during Mental Health Month. The team is cycling Ottawa to Montreal to raise awareness and funds, and to create a moment that encourages connection, conversation, and support.",
    backgroundMedia: {
      kind: "image",
      url: "/images/hero-main.png",
      alt: "Cyclist standing with a bike for the Gainables Ride for Mental Health campaign.",
    },
  },
  whyItMatters: {
    title: "Mental health affects everyone.",
    body:
      "Many people are dealing with stress, burnout, anxiety, and other challenges, often without visible support. This initiative exists to encourage open conversations, show visible support, and bring people together through action.",
  },
  route: {
    totalDistanceKm: 200,
    checkpoints: [
      { stage: "Start", name: "Ottawa", km: 0, distanceLabel: "0 km", lat: 45.4215, lng: -75.6972, note: "8:00 AM rollout from downtown Ottawa." },
      { stage: "25%", name: "Rockland", km: 50, distanceLabel: "50 km", lat: 45.5418, lng: -75.2921, note: "First support stop along the Ottawa River on Hwy 17." },
      { stage: "50%", name: "Hawkesbury", km: 100, distanceLabel: "100 km", lat: 45.6076, lng: -74.6058, note: "Halfway regroup before crossing into Quebec." },
      { stage: "75%", name: "Rigaud", km: 150, distanceLabel: "150 km", lat: 45.4814, lng: -74.303, note: "Final support stop before the push into Montreal." },
      { stage: "Finish", name: "Montreal", km: 200, distanceLabel: "200 km", lat: 45.5017, lng: -73.5673, note: "Ride complete - final supporter update." },
    ],
    polyline: [
      { lat: 45.4215, lng: -75.6972 },
      { lat: 45.4571, lng: -75.527 },
      { lat: 45.5418, lng: -75.2921 },
      { lat: 45.555, lng: -75.115 },
      { lat: 45.575, lng: -74.882 },
      { lat: 45.6076, lng: -74.6058 },
      { lat: 45.56, lng: -74.4 },
      { lat: 45.4814, lng: -74.303 },
      { lat: 45.452, lng: -74.135 },
      { lat: 45.4001, lng: -74.033 },
      { lat: 45.4472, lng: -73.8171 },
      { lat: 45.5017, lng: -73.5673 },
    ],
    mapCenter: { lat: 45.5, lng: -74.65, zoom: 7.5 },
  },
  media: {
    body:
      "The campaign is positioned for strong visibility across both social and traditional media, documented in real time through preparation, challenges, and the real moments behind the initiative.",
    links: [
      {
        label: "Instagram",
        handle: "gainables.ca",
        href: "https://www.instagram.com/gainables.ca/",
        description: "Primary channel - daily updates before and during the ride.",
      },
      {
        label: "TikTok",
        handle: "gainables.ca",
        href: "https://www.tiktok.com/@gainables.ca",
        description: "Short-form video content and campaign storytelling.",
      },
      {
        label: "Contact",
        handle: "admin@gainables.ca",
        href: "mailto:admin@gainables.ca",
        description: "Press, partnerships, sponsors, and general inquiries.",
      },
    ],
  },
  donate: {
    story:
      "Donating here is the most direct way to stand with the campaign. All funds raised are directed to CHEO Foundation and go toward mental health services and support programs, helping people who are dealing with stress, burnout, anxiety, and other challenges, often without visible support.",
    impact: [
      { title: "Care access", description: "Support programs, counselling access, and community-led mental health initiatives." },
      { title: "Awareness", description: "Keep the conversation active and visible before, during, and after ride day." },
      { title: "Community action", description: "Give supporters, sponsors, and riders a cause they can stand behind together." },
    ],
    fundAllocation: [
      {
        label: "CHEO Foundation",
        value: "100%",
        description: "Every dollar raised goes to CHEO Foundation for mental health services and support programs.",
      },
    ],
  },
  donationTotals: {
    raisedAmount: 0,
    goalAmount: 25000,
    donorCount: 0,
    currency: "CAD",
  },
  donationUrl: "mailto:admin@gainables.ca?subject=Ride%20for%20Mental%20Health%20Donation",
  donationEmbedUrl: null,
  trackerStatus: "pre_ride",
  rideDate: "2026-05-14T12:00:00.000Z",
};

export const fallbackSponsors: Sponsor[] = [];

export const fallbackRideUpdates: RideUpdate[] = [
  {
    id: "update-initial",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdAtLabel: "-",
    location: "Start line - Ottawa",
    kmCompleted: 0,
    nextCheckpoint: "Rockland",
    message: "Ride hasn't started yet. Live updates will appear here on ride day.",
    lat: 45.4215,
    lng: -75.6972,
    mediaUrl: null,
    mediaKind: null,
    mediaAlt: null,
  },
];

export const fallbackRidePositions: RidePosition[] = [];

export const fallbackFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "Where do donations go?",
    answer:
      "All funds raised are directed toward mental health services and support programs through the campaign's confirmed cause partner.",
    sortOrder: 1,
    visible: true,
  },
  {
    id: "faq-2",
    question: "What is Ride for Mental Health?",
    answer:
      "Ride for Mental Health is a community-driven initiative led by Gainables during Mental Health Month. The Gainables team is cycling about 200 km from Ottawa to Montreal to raise awareness and funds for mental health while bringing people together through a shared experience.",
    sortOrder: 2,
    visible: true,
  },
  {
    id: "faq-3",
    question: "Can supporters follow the ride live?",
    answer:
      "Yes. The tracker page provides real-time location updates throughout the ride, with checkpoint progress and a live status card so supporters can follow along from anywhere.",
    sortOrder: 3,
    visible: true,
  },
  {
    id: "faq-4",
    question: "How can sponsors get involved?",
    answer:
      "This campaign is supported by a growing network of partners. Sponsors are integrated across jerseys, the website, social media content, and campaign materials. Reach out through the sponsor contact to start a conversation.",
    sortOrder: 4,
    visible: true,
  },
];
