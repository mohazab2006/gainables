import type { Metadata } from "next";

import { CausePartnerSection } from "@/components/sections/cause-partner";
import { GallerySection } from "@/components/sections/gallery";
import { MediaSocialSection } from "@/components/sections/media-social";
import { PillarsSection } from "@/components/sections/pillars";
import { getSiteContent } from "@/lib/content";

export const metadata: Metadata = {
  title: "About",
  description:
    "Why Gainables is riding from Ottawa to Montreal for mental health, who's involved, and how the campaign comes together.",
};

export default async function AboutPage() {
  const content = await getSiteContent();

  return (
    <main className="min-h-screen bg-background">
      <section className="border-b border-foreground px-6 pb-20 pt-40 md:px-10 md:pt-48">
        <div className="container-shell">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
            {content.about.eyebrow}
          </p>
          <h1 className="mt-8 max-w-6xl font-display text-6xl leading-[0.9] md:text-8xl lg:text-[8vw]">
            {content.about.title.toUpperCase()}
          </h1>
          <p className="mt-10 max-w-3xl text-base leading-8 text-foreground md:text-lg">
            {content.about.body}
          </p>
        </div>
      </section>

      <PillarsSection pillars={content.pillars} />
      <GallerySection gallery={content.gallery} />
      <CausePartnerSection causePartner={content.causePartner} />
      <MediaSocialSection media={content.media} />
    </main>
  );
}
