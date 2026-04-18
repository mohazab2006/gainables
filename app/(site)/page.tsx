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

export default async function HomePage() {
  const [content, sponsors, faqs, latestUpdate] = await Promise.all([
    getSiteContent(),
    getSponsors(),
    getFaqs(),
    getLatestRideUpdate(),
  ]);

  return (
    <main className="min-h-screen bg-background">
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
