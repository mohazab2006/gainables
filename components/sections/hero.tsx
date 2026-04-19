"use client";

import { useRef } from "react";
import Link from "next/link";

import { gsap, useGSAP } from "@/lib/gsap";
import type { HeroContent, StatItem } from "@/lib/fallback-content";

type HeroSectionProps = {
  hero: HeroContent;
  stats: StatItem[];
};

export function HeroSection({ hero }: HeroSectionProps) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();

      mm.add(
        {
          motionOk: "(prefers-reduced-motion: no-preference)",
          reduce: "(prefers-reduced-motion: reduce)",
        },
        (ctx) => {
          if (!root.current) return;
          const reduce = ctx.conditions?.reduce;

          gsap.set("[data-hero-eyebrow]", { autoAlpha: 0, y: 12 });
          gsap.set("[data-hero-word]", { yPercent: 110, autoAlpha: 0 });
          gsap.set("[data-hero-meta]", { autoAlpha: 0, y: 16 });
          gsap.set("[data-hero-cta]", { autoAlpha: 0, y: 12 });

          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: reduce ? 0 : 0.9 },
          });

          tl.to("[data-hero-eyebrow]", { autoAlpha: 1, y: 0, duration: 0.5 })
            .to(
              "[data-hero-word]",
              {
                yPercent: 0,
                autoAlpha: 1,
                duration: 1,
                ease: "expo.out",
                stagger: reduce ? 0 : 0.08,
              },
              "-=0.25",
            )
            .to("[data-hero-meta]", { autoAlpha: 1, y: 0, duration: 0.6 }, "-=0.5")
            .to("[data-hero-cta]", { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.08 }, "-=0.4");
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  const titleWords = hero.title.split(" ");

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-screen flex-col justify-between overflow-hidden bg-background pt-32 pb-12 md:pt-40 md:pb-16"
    >
      <div className="px-6 md:px-10">
        <p
          data-hero-eyebrow
          className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground"
        >
          {hero.eyebrow}
        </p>
      </div>

      <div className="px-6 md:px-10">
        <h1 className="font-display text-foreground text-[18vw] leading-[0.85] tracking-[-0.01em] md:text-[14vw]">
          {titleWords.map((word, index) => (
            <span
              key={`${word}-${index}`}
              className="block overflow-hidden align-bottom"
            >
              <span data-hero-word className="block">
                {word}
              </span>
            </span>
          ))}
        </h1>
      </div>

      <div className="mt-16 flex flex-col gap-8 px-6 md:mt-20 md:flex-row md:items-end md:justify-between md:px-10">
        <p
          data-hero-meta
          className="max-w-md text-sm leading-7 text-foreground md:text-base"
        >
          {hero.description}
        </p>
        <div className="flex flex-wrap gap-3">
          <Link data-hero-cta href={hero.primaryCta.href} className="pill-cta">
            {hero.primaryCta.label}
          </Link>
          <Link data-hero-cta href={hero.secondaryCta.href} className="pill-ghost">
            {hero.secondaryCta.label}
          </Link>
        </div>
      </div>
    </section>
  );
}
