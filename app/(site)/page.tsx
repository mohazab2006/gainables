import type { Metadata } from "next";

import { HeroSection } from "@/components/sections/hero";
import { MissionSection } from "@/components/sections/mission";
import { MoneyRaisedSection } from "@/components/sections/money-raised";
import { RouteSection } from "@/components/sections/route";
import { SponsorsSection } from "@/components/sections/sponsors";
import { getSiteContent, getSponsors } from "@/lib/content";
import { getSiteUrl } from "@/lib/env";

export const metadata: Metadata = {
  description:
    "Support Gainables' Ride for Mental Health, track the Ottawa to Montreal route, and follow campaign updates in real time.",
};

export default async function HomePage() {
  const [content, sponsors] = await Promise.all([getSiteContent(), getSponsors()]);
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
      <MoneyRaisedSection stats={content.stats} donationUrl={content.donationUrl} />
      <RouteSection about={content.about} route={content.route} />
      <SponsorsSection sponsors={sponsors} />
    </main>
  );
}
