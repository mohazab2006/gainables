"use client";

import { useReveal } from "@/hooks/use-reveal";
import type { CausePartnerContent } from "@/lib/fallback-content";

export function CausePartnerSection({ causePartner }: { causePartner: CausePartnerContent }) {
  const ref = useReveal<HTMLDivElement>({ y: 28, stagger: 0.08 });

  return (
    <section className="border-t border-foreground bg-foreground text-background">
      <div ref={ref} className="px-6 py-24 md:px-10 md:py-36">
        <div className="container-shell">
          <p
            data-reveal
            className="text-[0.7rem] uppercase tracking-[0.32em] text-background/60"
          >
            {causePartner.eyebrow}
          </p>
          <blockquote
            data-reveal
            className="mt-8 max-w-6xl font-display text-4xl leading-[1.05] md:text-7xl lg:text-[5vw]"
          >
            &quot;{causePartner.quote.toUpperCase()}&quot;
          </blockquote>
          <p
            data-reveal
            className="mt-12 max-w-3xl text-sm leading-7 text-background/70 md:text-base md:leading-8"
          >
            {causePartner.body}
          </p>
        </div>
      </div>
    </section>
  );
}
