import type { Metadata } from "next";

import { BikerTimelineSection } from "@/components/sections/biker-timeline";
import { ContactStrip } from "@/components/sections/contact-strip";
import { DonationsStrip } from "@/components/sections/donations-strip";
import { GainablesHero } from "@/components/sections/gainables-hero";
import { MissionStrip } from "@/components/sections/mission-strip";
import { SignupStrip } from "@/components/sections/signup-strip";
import { SponsorStrip } from "@/components/sections/sponsor-strip";
import { getLatestRideUpdate, getSiteContent, getSponsors } from "@/lib/content";
import { getSiteUrl } from "@/lib/env";
import { getTrackerSnapshot } from "@/lib/track";

export const metadata: Metadata = {
  description:
    "Gainables Ride for Mental Health — a live-synced Ottawa to Montreal journey. Track the biker, donate, and drive the conversation forward.",
};

export default async function HomePage() {
  const [content, sponsors, latestUpdate] = await Promise.all([
    getSiteContent(),
    getSponsors(),
    getLatestRideUpdate(),
  ]);
  const siteUrl = getSiteUrl();
  const snapshot = getTrackerSnapshot(content.route, latestUpdate);

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
    organizer: { "@type": "Organization", name: "Gainables", url: siteUrl },
    location: {
      "@type": "Place",
      name: "Ottawa to Montreal Route",
      address: { "@type": "PostalAddress", addressLocality: "Ottawa to Montreal", addressCountry: "CA" },
    },
    offers: {
      "@type": "Offer",
      url: content.donationUrl,
      availability: "https://schema.org/InStock",
      price: "0",
      priceCurrency: content.donationTotals.currency,
    },
  };

  return (
    <main className="min-h-screen bg-background text-foreground">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }} />

      {/* 1. Hero — massive wordmark + tagline + CTAs */}
      <GainablesHero hero={content.hero} donationUrl={content.donationUrl} />

      {/* 2. Live biker timeline — the centerpiece */}
      <BikerTimelineSection
        route={content.route}
        progressPercent={snapshot.progressPercent}
        kmCompleted={latestUpdate.kmCompleted}
        currentLocation={latestUpdate.location}
        donationUrl={content.donationUrl}
      />

      {/* 3. Donations — live counter + CTA */}
      <DonationsStrip
        donationUrl={content.donationUrl}
        raisedAmount={content.donationTotals.raisedAmount}
        goalAmount={content.donationTotals.goalAmount}
        donorCount={content.donationTotals.donorCount}
        currency={content.donationTotals.currency}
      />

      {/* 4. Mission */}
      <MissionStrip whyItMatters={content.whyItMatters} />

      {/* 5. Sponsors — floating logos, no cards */}
      <SponsorStrip sponsors={sponsors} />

      {/* 6. Email signup */}
      <SignupStrip />

      {/* 7. Contact / socials */}
      <ContactStrip media={content.media} />
    </main>
  );
}
