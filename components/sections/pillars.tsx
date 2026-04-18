"use client";

import { useRef } from "react";
import Image from "next/image";

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
          { autoAlpha: 0, y: 60 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 1,
            stagger: 0.12,
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
    <section ref={root} className="bg-background px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="container-shell">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div data-pillar-head>
            <p className="eyebrow">Campaign pillars</p>
            <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.025em] md:text-6xl">
              Visibility, funding, and <span className="display-italic">collective</span> momentum.
            </h2>
          </div>
          <p data-pillar-head className="max-w-md text-base leading-7 text-muted-foreground">
            Each pillar maps to a concrete objective — so the page reads as a campaign with intent, not a generic
            fundraiser.
          </p>
        </div>

        <div data-pillar-grid className="mt-14 grid gap-6 lg:grid-cols-3">
          {pillars.map((pillar, idx) => (
            <article
              key={pillar.title}
              data-pillar-card
              className="group relative overflow-hidden rounded-[2rem] border border-border bg-surface transition-shadow duration-500 hover:shadow-[0_40px_120px_rgba(14,14,12,0.08)]"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <Image
                  src={pillar.image.src}
                  alt={pillar.image.alt}
                  fill
                  sizes="(max-width: 1024px) 100vw, 33vw"
                  className="object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-[1.06]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
                <div className="absolute left-5 top-5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-medium text-foreground">
                  {String(idx + 1).padStart(2, "0")}
                </div>
              </div>
              <div className="p-7">
                <p className="eyebrow">{pillar.kicker}</p>
                <h3 className="mt-4 font-display text-2xl leading-tight tracking-tight md:text-[1.65rem]">
                  {pillar.title}
                </h3>
                <p className="mt-4 text-base leading-7 text-muted-foreground">{pillar.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
