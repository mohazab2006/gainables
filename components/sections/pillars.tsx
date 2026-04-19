"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import type { Pillar } from "@/lib/fallback-content";

export function PillarsSection({ pillars }: { pillars: Pillar[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!root.current) return;
        gsap.fromTo(
          "[data-pillar-head]",
          { autoAlpha: 0, y: 24 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: "top 75%" },
          },
        );
        gsap.fromTo(
          "[data-pillar-card]",
          { autoAlpha: 0, y: 40 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.1,
            ease: "power3.out",
            scrollTrigger: { trigger: "[data-pillar-grid]", start: "top 78%" },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="border-t border-foreground bg-background text-foreground">
      <div className="px-6 py-24 md:px-10 md:py-32">
        <div className="container-shell">
          <div data-pillar-head>
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              Campaign pillars
            </p>
            <h2 className="mt-6 max-w-5xl font-display text-5xl leading-[0.92] md:text-7xl lg:text-[6vw]">
              VISIBILITY,
              <br />
              FUNDING,
              <br />
              MOMENTUM.
            </h2>
          </div>

          <div
            data-pillar-grid
            className="mt-20 grid gap-0 border-t border-foreground md:grid-cols-3"
          >
            {pillars.map((pillar, idx) => (
              <article
                key={pillar.title}
                data-pillar-card
                className="border-b border-foreground p-8 last:border-b-0 md:border-b-0 md:border-r md:p-10 md:last:border-r-0"
              >
                <p className="font-display text-6xl leading-none text-foreground/30 md:text-7xl">
                  {String(idx + 1).padStart(2, "0")}
                </p>
                <p className="mt-8 text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground">
                  {pillar.kicker}
                </p>
                <h3 className="mt-3 font-display text-2xl leading-tight md:text-3xl">
                  {pillar.title.toUpperCase()}
                </h3>
                <p className="mt-4 text-sm leading-7 text-muted-foreground">{pillar.description}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
