"use client";

import { useRef } from "react";
import Link from "next/link";
import { ArrowDown } from "lucide-react";

import { gsap, useGSAP } from "@/lib/gsap";
import type { HeroContent } from "@/lib/fallback-content";

type Props = {
  hero: HeroContent;
  donationUrl: string;
};

export function GainablesHero({ hero, donationUrl }: Props) {
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
          const reduce = ctx.conditions?.reduce;
          const tl = gsap.timeline({
            defaults: { ease: "expo.out", duration: reduce ? 0 : 1.1 },
          });
          tl.from("[data-eyebrow]", { autoAlpha: 0, y: 10, duration: 0.6 })
            .from(
              "[data-wordmark-char]",
              { yPercent: 110, autoAlpha: 0, stagger: reduce ? 0 : 0.04 },
              "-=0.3",
            )
            .from("[data-tagline]", { autoAlpha: 0, y: 20, duration: 0.7 }, "-=0.6")
            .from("[data-hero-cta]", { autoAlpha: 0, y: 14, stagger: 0.08, duration: 0.5 }, "-=0.4")
            .from("[data-hero-meta]", { autoAlpha: 0, y: 10, duration: 0.5 }, "-=0.3");
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  const wordmark = "GAINABLES";

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-[100svh] flex-col justify-between overflow-hidden bg-background px-6 pt-10 pb-10 md:px-12 md:pt-12 md:pb-14 lg:px-20"
    >
      {/* Top bar: eyebrow + corner markers */}
      <div className="flex items-start justify-between">
        <span data-eyebrow className="eyebrow text-foreground/80">
          {hero.eyebrow ?? "Ride for Mental Health"}
        </span>
        <span data-eyebrow className="eyebrow hidden md:inline">Ottawa → Montreal · 200 km</span>
      </div>

      {/* The massive wordmark — edge to edge. The overflow-hidden mask gets
          a tiny vertical pad so Anton's caps sit inside the mask cleanly. */}
      <div className="relative flex flex-1 items-center justify-center py-10">
        <h1
          aria-label={wordmark}
          className="display-mega select-none text-[22vw] md:text-[19vw]"
        >
          <span
            aria-hidden
            className="block overflow-hidden"
            style={{ padding: "0.06em 0" }}
          >
            {wordmark.split("").map((ch, i) => (
              <span
                key={`${ch}-${i}`}
                data-wordmark-char
                className="inline-block"
                style={{ willChange: "transform, opacity" }}
              >
                {ch}
              </span>
            ))}
          </span>
        </h1>
      </div>

      {/* Tagline + CTAs */}
      <div className="grid gap-8 md:grid-cols-[1fr_auto] md:items-end">
        <p
          data-tagline
          className="max-w-xl font-serif text-2xl leading-[1.15] text-foreground md:text-3xl lg:text-4xl"
        >
          {hero.description}
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <Link data-hero-cta href={donationUrl} className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]">
            Donate now
          </Link>
          <Link data-hero-cta href="#track" className="pill-ghost">
            Track the ride
          </Link>
        </div>
      </div>

      {/* Bottom meta row */}
      <div data-hero-meta className="mt-12 flex items-end justify-between gap-4 border-t border-white/10 pt-6">
        <div className="flex items-center gap-3 text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
          <ArrowDown size={14} />
          Scroll
        </div>
        <Link
          href="#signup"
          className="group inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-foreground transition hover:text-accent"
        >
          Subscribe for updates
          <span
            aria-hidden
            className="inline-block h-px w-6 bg-foreground transition-all duration-300 group-hover:w-10 group-hover:bg-accent"
          />
        </Link>
      </div>
    </section>
  );
}
