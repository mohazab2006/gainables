import type { Metadata } from "next";

import { CausePartnerSection } from "@/components/sections/cause-partner";
import { DonateBannerSection } from "@/components/sections/donate-banner";
import { EmailSignupSection } from "@/components/sections/email-signup";
import { FaqSection } from "@/components/sections/faq";
import { GallerySection } from "@/components/sections/gallery";
import { HeroSection } from "@/components/sections/hero";
import { MediaSocialSection } from "@/components/sections/media-social";
import { MissionSection } from "@/components/sections/mission";
import { PillarsSection } from "@/components/sections/pillars";
import { RouteSection } from "@/components/sections/route";
import { SponsorsSection } from "@/components/sections/sponsors";
import { StatsSection } from "@/components/sections/stats";
import { TrackingPreviewSection } from "@/components/sections/tracking-preview";
import { getFaqs, getLatestRideUpdate, getSiteContent, getSponsors } from "@/lib/content";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  description:
    "Support Gainables' Ride for Mental Health, track the Ottawa to Montreal route, and follow campaign updates in real time.",
};

export default async function HomePage() {
  const [content, sponsors, faqs, latestUpdate] = await Promise.all([
    getSiteContent(),
    getSponsors(),
    getFaqs(),
    getLatestRideUpdate(),
  ]);
  const siteUrl = getSiteUrl();
  const eventSchema = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: "Ride for Mental Health",
    description: content.hero.description,
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus:
      content.trackerStatus === "finished"
        ? "https://schema.org/EventCompleted"
        : "https://schema.org/EventScheduled",
    startDate: content.rideDate,
    endDate: content.rideDate,
    image: [`${siteUrl}/opengraph-image`],
    organizer: {
      "@type": "Organization",
      name: "Gainables",
      url: siteUrl,
    },
    location: {
      "@type": "Place",
      name: "Ottawa to Montreal Route",
      address: {
        "@type": "PostalAddress",
        addressLocality: "Ottawa to Montreal",
        addressCountry: "CA",
      },
    },
    offers: {
      "@type": "Offer",
      url: content.donationUrl,
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: "CAD",
    },
  };

  return (
    <main className="min-h-screen bg-background">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />
      <HeroSection hero={content.hero} stats={content.stats} />
      <MissionSection whyItMatters={content.whyItMatters} />
      <RouteSection about={content.about} route={content.route} />
      <PillarsSection pillars={content.pillars} />
      <StatsSection stats={content.stats} />
      <GallerySection gallery={content.gallery} />
      <TrackingPreviewSection
        donationUrl={content.donationUrl}
        routeTotalDistanceKm={content.route.totalDistanceKm}
        trackerEmbedUrl={content.trackerEmbedUrl}
        update={latestUpdate}
      />
      <DonateBannerSection donationUrl={content.donationUrl} donate={content.donate} />
      <SponsorsSection sponsors={sponsors} />
      <CausePartnerSection causePartner={content.causePartner} />
      <MediaSocialSection media={content.media} />
      <FaqSection faqs={faqs} />
      <EmailSignupSection />
    </main>
  );
}
