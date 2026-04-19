"use client";

import { useReveal } from "@/hooks/use-reveal";
import type { WhyItMattersContent } from "@/lib/fallback-content";

export function MissionStrip({ whyItMatters }: { whyItMatters: WhyItMattersContent }) {
  const ref = useReveal<HTMLDivElement>({ y: 24, stagger: 0.08 });

  return (
    <section
      id="mission"
      className="relative bg-background px-6 py-24 md:px-12 md:py-36 lg:px-20"
    >
      <div ref={ref} className="container-shell grid gap-10 md:grid-cols-[auto_1fr] md:gap-16">
        <p data-reveal className="eyebrow md:pt-4">The Mission</p>
        <div data-reveal>
          <p className="display-hero max-w-5xl text-4xl leading-[0.96] md:text-7xl lg:text-[5.5rem]">
            {whyItMatters.title}
          </p>
          <p data-reveal className="mt-10 max-w-3xl font-serif text-xl leading-[1.4] text-muted-foreground md:text-2xl">
            {whyItMatters.body}
          </p>
        </div>
      </div>
    </section>
  );
}
