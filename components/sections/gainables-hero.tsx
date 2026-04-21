"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";

import type { HeroContent } from "@/lib/fallback-content";

type Props = {
  hero: HeroContent;
};

export function GainablesHero({ hero }: Props) {
  const root = useRef<HTMLElement>(null);
  // Every donate CTA on the marketing surface routes to the internal
  // /donate page — only the button on /donate itself uses the admin-
  // configured donation URL directly.
  const donationHref = "/donate";

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
          <div className="absolute inset-0 bg-black/55" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(0,0,0,0.26),rgba(0,0,0,0.42)_40%,rgba(0,0,0,0.76)_100%)]" />
        </div>
      ) : (
        <div aria-hidden data-hero-bg className="absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(200,226,92,0.16),transparent_28%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,#1a1a1a_0%,#080808_100%)]" />
        </div>
      )}

      <div className="relative z-10 mx-auto w-full max-w-6xl pt-24 pb-10 md:pt-0 md:pb-16">
        <div className="max-w-5xl">
          <div className="relative mb-6 h-14 w-14 md:mb-8 md:h-20 md:w-20">
            <Image
              src="/gainables-mark.png"
              alt="Gainables"
              fill
              priority
              sizes="(min-width: 768px) 80px, 56px"
              className="object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 8px rgba(255,255,255,0.22)) drop-shadow(0 0 22px rgba(255,255,255,0.12))",
              }}
            />
          </div>
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
              className="inline-flex items-center justify-center rounded-full bg-accent px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-accent-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]"
            >
              Donate now
            </Link>
            <Link
              data-hero-cta
              href="#track"
              className="inline-flex items-center justify-center rounded-full border border-white/35 bg-black/30 px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/16"
            >
              Track the ride
            </Link>
            <Link
              data-hero-cta
              href="#signup"
              className="inline-flex items-center justify-center rounded-full border border-white/35 bg-black/30 px-7 py-4 text-sm font-semibold uppercase tracking-[0.18em] text-white transition-all duration-300 hover:-translate-y-0.5 hover:border-white hover:bg-white/16"
            >
              Subscribe for updates
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
