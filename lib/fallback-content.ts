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

export type DonationTotals = {
  raisedAmount: number;
  goalAmount: number;
  donorCount: number;
  currency: string;
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
  donationTotals: DonationTotals;
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
      "A community-driven initiative from Gainables during Mental Health Month. The team is cycling Ottawa to Montreal to raise awareness and funds — and to create a moment that encourages connection, conversation, and support.",
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
    { label: "Distance", value: "~200 km", description: "A single-day endurance ride from Ottawa to Montreal, documented in real time." },
    { label: "Window", value: "Mental Health Month", description: "The campaign runs during Mental Health Month to keep the conversation visible." },
    { label: "Community", value: "0 donors", description: "Supporters, riders, and sponsors moving the campaign forward together." },
    { label: "Pledged", value: "$0 raised", description: "Every dollar pledged is directed toward mental health services and support programs." },
  ],
  whyItMatters: {
    eyebrow: "Why it matters",
    title: "Mental health affects everyone.",
    body:
      "Many people are dealing with stress, burnout, anxiety, and other challenges, often without visible support. This initiative exists to encourage open conversations, show visible support, and bring people together through action.",
    image: {
      src: "/images/ride-3.jpg",
      alt: "Cyclist on a quiet road with mountains in the distance",
    },
  },
  about: {
    eyebrow: "About the ride",
    title: "A community-driven initiative from Ottawa to Montreal.",
    body:
      "Ride for Mental Health is led by Gainables during Mental Health Month. Through a long-distance cycling journey from Ottawa to Montreal, the campaign raises awareness and funds for mental health while bringing people together through a shared experience — supported by partners, sponsors, and media outreach, and documented across social platforms in real time.",
    highlights: [
      { label: "Route", value: "Ottawa → Montreal" },
      { label: "Distance", value: "~200 km" },
      { label: "Riders", value: "Gainables team members" },
      { label: "Format", value: "Endurance ride documented in real time" },
    ],
  },
  route: {
    eyebrow: "Route overview",
    title: "Ottawa to Montreal with visible checkpoints.",
    summary:
      "The ride represents discipline, consistency, and pushing through difficulty — values that reflect the mental health journey. Checkpoints along the route give supporters a sense of scale and make the campaign feel concrete before ride day.",
    totalDistanceKm: 200,
    checkpoints: [
      { stage: "Start", name: "Ottawa", km: 0, distanceLabel: "0 km", lat: 45.4215, lng: -75.6972, note: "8:00 AM rollout from downtown Ottawa." },
      { stage: "25%", name: "Rockland", km: 50, distanceLabel: "50 km", lat: 45.5418, lng: -75.2921, note: "First support stop along the Ottawa River on Hwy 17." },
      { stage: "50%", name: "Hawkesbury", km: 100, distanceLabel: "100 km", lat: 45.6076, lng: -74.6058, note: "Halfway regroup before crossing into Quebec." },
      { stage: "75%", name: "Rigaud", km: 150, distanceLabel: "150 km", lat: 45.4814, lng: -74.3030, note: "Final support stop before the push into Montreal." },
      { stage: "Finish", name: "Montreal", km: 200, distanceLabel: "200 km", lat: 45.5017, lng: -73.5673, note: "Ride complete — final supporter update." },
    ],
    polyline: [
      { lat: 45.4215, lng: -75.6972 },
      { lat: 45.4571, lng: -75.5270 },
      { lat: 45.5418, lng: -75.2921 },
      { lat: 45.5550, lng: -75.1150 },
      { lat: 45.5750, lng: -74.8820 },
      { lat: 45.6076, lng: -74.6058 },
      { lat: 45.5600, lng: -74.4000 },
      { lat: 45.4814, lng: -74.3030 },
      { lat: 45.4520, lng: -74.1350 },
      { lat: 45.4001, lng: -74.0330 },
      { lat: 45.4472, lng: -73.8171 },
      { lat: 45.5017, lng: -73.5673 },
    ],
    mapCenter: { lat: 45.5, lng: -74.65, zoom: 7.5 },
  },
  pillars: [
    {
      kicker: "Encourage open conversations",
      title: "Make mental health easier to talk about.",
      description: "Use the ride as a reason to start honest conversations about stress, burnout, anxiety, and the challenges people carry without visible support.",
      image: { src: "/images/ride-1.jpg", alt: "Cyclists grouped together before a ride" },
    },
    {
      kicker: "Show visible support",
      title: "Turn movement into a public stand.",
      description: "Every kilometre, update, and sponsor moment signals to people quietly struggling that there is a community in their corner.",
      image: { src: "/images/ride-3.jpg", alt: "Cyclist training solo on a road ride" },
    },
    {
      kicker: "Bring people together through action",
      title: "Give supporters, sponsors, and riders a shared moment.",
      description: "Partners, donors, and riders all move the campaign forward together — before, during, and after the ride.",
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
    eyebrow: "Cause partner",
    quote:
      "All funds raised are directed toward mental health services and support programs.",
    body:
      "This initiative supports mental health programs in partnership with a confirmed cause organization. The partner name will be published here once the collaboration is finalized — until then, the commitment on where funds go remains the same.",
    image: { src: "/images/ride-2.jpg", alt: "Cycling route image used for cause partner section" },
  },
  media: {
    title: "Follow the journey across training, preparation, and ride-day moments.",
    body:
      "The campaign is positioned for strong visibility across both social and traditional media — documented in real time through preparation, challenges, and the real moments behind the initiative.",
    links: [
      {
        label: "Instagram",
        handle: "gainables.ca",
        href: "https://www.instagram.com/gainables.ca/",
        description: "Primary channel — daily updates before and during the ride.",
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
    bannerTitle: "All funds raised go directly to mental health support.",
    bannerBody:
      "Every contribution helps raise awareness and fund mental health services and programs. Follow the ride, share the campaign, and donate to help make a meaningful impact.",
    story:
      "Donating here is the most direct way to stand with the campaign. All funds raised are directed toward mental health services and support programs — helping people who are dealing with stress, burnout, anxiety, and other challenges, often without visible support.",
    impact: [
      { title: "Care access", description: "Support programs, counselling access, and community-led mental health initiatives." },
      { title: "Awareness", description: "Keep the conversation active and visible before, during, and after ride day." },
      { title: "Community action", description: "Give supporters, sponsors, and riders a cause they can stand behind together." },
    ],
    fundAllocation: [
      {
        label: "Mental health services",
        value: "Primary",
        description: "Funds are directed toward mental health services, programs, and support efforts through our cause partner.",
      },
      {
        label: "Campaign reach",
        value: "Secondary",
        description: "A trackable, well-documented campaign keeps supporters following the ride and keeps the cause visible.",
      },
      {
        label: "Sponsor match",
        value: "Optional",
        description: "Room for a sponsor match block if that becomes part of the fundraising strategy.",
      },
    ],
  },
  donationTotals: {
    raisedAmount: 0,
    goalAmount: 25000,
    donorCount: 0,
    currency: "CAD",
  },
  donationUrl: "https://example.com/donate",
  donationEmbedUrl: null,
  trackerEmbedUrl: null,
  trackerStatus: "pre_ride",
  rideDate: "2026-05-14T12:00:00.000Z",
};

export const fallbackSponsors: Sponsor[] = [];

export const fallbackRideUpdates: RideUpdate[] = [
  {
    id: "update-initial",
    createdAt: "2026-01-01T00:00:00.000Z",
    createdAtLabel: "—",
    location: "Start line · Ottawa",
    kmCompleted: 0,
    nextCheckpoint: "Rockland",
    message: "Ride hasn't started yet. Live updates will appear here on ride day.",
    lat: 45.4215,
    lng: -75.6972,
  },
];

export const fallbackRidePositions: RidePosition[] = [];

export const fallbackFaqs: FaqItem[] = [
  {
    id: "faq-1",
    question: "Where do donations go?",
    answer:
      "All funds raised are directed toward mental health services and support programs through the campaign’s confirmed cause partner.",
    sortOrder: 1,
    visible: true,
  },
  {
    id: "faq-2",
    question: "What is Ride for Mental Health?",
    answer:
      "Ride for Mental Health is a community-driven initiative led by Gainables during Mental Health Month. The Gainables team is cycling ~200 km from Ottawa to Montreal to raise awareness and funds for mental health, while bringing people together through a shared experience.",
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
