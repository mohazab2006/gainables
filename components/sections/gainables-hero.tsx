"use client";

import { useRef } from "react";
import Link from "next/link";

import { gsap, useGSAP } from "@/lib/gsap";
import type { HeroContent } from "@/lib/fallback-content";

type Props = {
  hero: HeroContent;
  donationUrl: string;
};

export function GainablesHero({ hero, donationUrl }: Props) {
  const root = useRef<HTMLElement>(null);
  const donationHref = donationUrl || "/donate";

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

          tl.from("[data-hero-bg]", {
            autoAlpha: 0,
            scale: 1.03,
            duration: reduce ? 0 : 1.2,
            ease: "expo.out",
          })
            .from("[data-hero-title]", { autoAlpha: 0, y: 16, duration: 0.6 }, "-=0.8")
            .from("[data-tagline]", { autoAlpha: 0, y: 18, duration: 0.7 }, "-=0.35")
            .from("[data-hero-cta]", { autoAlpha: 0, y: 12, stagger: 0.08, duration: 0.45 }, "-=0.3")
            .from("[data-hero-meta]", { autoAlpha: 0, y: 10, duration: 0.45 }, "-=0.2");
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section
      ref={root}
      className="relative isolate flex min-h-svh flex-col justify-end overflow-hidden bg-neutral-950 px-6 pt-10 pb-10 text-white md:px-12 md:pt-12 md:pb-14 lg:px-20"
    >
      {hero.backgroundMedia ? (
        <div aria-hidden data-hero-bg className="absolute inset-0 -z-20 overflow-hidden">
          {hero.backgroundMedia.kind === "video" ? (
            <video
              className="h-full w-full object-cover"
              autoPlay
              muted
              loop
              playsInline
              poster={hero.backgroundMedia.posterUrl}
            >
              <source src={hero.backgroundMedia.url} />
            </video>
          ) : (
            <img
              src={hero.backgroundMedia.url}
              alt=""
              className="h-full w-full object-cover"
            />
          )}
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.18),rgba(0,0,0,0.32)_40%,rgba(0,0,0,0.68)_100%)]" />
        </div>
      ) : (
        <div aria-hidden data-hero-bg className="absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,226,92,0.16),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#1a1a1a_0%,#080808_100%)]" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-6xl pb-10 md:pb-16">
        <div className="max-w-5xl">
          <h1 data-hero-title className="display-hero text-5xl text-white md:text-7xl lg:text-8xl">
            Ride for Mental Health
          </h1>
          <p
            data-tagline
            className="mt-5 max-w-2xl font-serif text-xl leading-[1.15] text-white/88 md:text-2xl lg:text-3xl"
          >
            {hero.description}
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link
              data-hero-cta
              href={donationHref}
              className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]"
            >
              Donate now
            </Link>
            <Link
              data-hero-cta
              href="#track"
              className="pill-ghost border-white/25 bg-white/8 text-white hover:bg-white/14"
            >
              Track the ride
            </Link>
            <Link
              data-hero-cta
              href="#signup"
              className="pill-ghost border-white/25 bg-white/8 text-white hover:bg-white/14"
            >
              Subscribe for updates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
