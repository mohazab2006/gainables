"use client";

import { useRef } from "react";
import Image from "next/image";
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
          tl.from("[data-hero-mark]", {
            autoAlpha: 0,
            scale: 0.7,
            filter: "blur(14px)",
            duration: reduce ? 0 : 1.2,
            ease: "expo.out",
          })
            .from("[data-eyebrow]", { autoAlpha: 0, y: 10, duration: 0.6 }, "-=0.7")
            .from(
              "[data-wordmark-char]",
              { yPercent: 110, autoAlpha: 0, stagger: reduce ? 0 : 0.04 },
              "-=0.3",
            )
            .from("[data-tagline]", { autoAlpha: 0, y: 20, duration: 0.7 }, "-=0.6")
            .from("[data-hero-cta]", { autoAlpha: 0, y: 14, stagger: 0.08, duration: 0.5 }, "-=0.4")
            .from("[data-hero-meta]", { autoAlpha: 0, y: 10, duration: 0.5 }, "-=0.3");

          if (!reduce) {
            // Subtle endless glow pulse — quiet enough that you only notice
            // it on a still frame, not while reading.
            gsap.to("[data-hero-mark-glow]", {
              opacity: 0.32,
              scale: 1.05,
              duration: 4,
              ease: "sine.inOut",
              yoyo: true,
              repeat: -1,
            });
          }
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
      className="relative isolate flex min-h-svh flex-col justify-between overflow-hidden bg-background px-6 pt-10 pb-10 md:px-12 md:pt-12 md:pb-14 lg:px-20"
    >
      {/* Ambient lift — soft radial glows so the page reads less "void" and
          more "stage". Pure white + a touch of accent, very low opacity. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-[-10%] h-[70vh] w-[90vw] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(255,255,255,0.16),rgba(255,255,255,0.04)_45%,transparent_75%)] blur-3xl" />
        <div className="absolute left-1/2 top-1/2 h-[60vh] w-[70vw] -translate-x-1/2 -translate-y-1/3 rounded-full bg-[radial-gradient(closest-side,rgba(200,226,92,0.10),transparent_70%)] blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-linear-to-t from-background to-transparent" />
      </div>

      {/* Top bar: brand mark (centered) + flanking eyebrows.
          3-column grid keeps the mark in the middle column so the side
          eyebrows can never extend under it on narrow screens. */}
      <div className="relative grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <span data-eyebrow className="eyebrow min-w-0 truncate text-foreground/80">
          {hero.eyebrow ?? "Ride for Mental Health"}
        </span>

        {/* Centered brand mark. Transparent-bg PNG with a soft, understated
            bloom from layered drop-shadows. */}
        <div data-hero-mark className="pointer-events-none relative z-10" aria-hidden>
          {/* Subtle ambient halo — well outside the mark's bounding box so
              it stays a soft glow, not a hot ring around the logo. */}
          <div
            data-hero-mark-glow
            className="absolute left-1/2 top-1/2 -z-10 h-48 w-48 -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-3xl md:h-64 md:w-64"
            style={{
              background:
                "radial-gradient(closest-side, rgba(255,255,255,0.28), rgba(255,255,255,0.06) 45%, transparent 78%)",
            }}
          />
          <div className="relative h-14 w-14 md:h-20 md:w-20">
            <Image
              src="/gainables-mark.png"
              alt="Gainables"
              fill
              priority
              sizes="(min-width: 768px) 80px, 56px"
              className="object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 6px rgba(255,255,255,0.35)) drop-shadow(0 0 18px rgba(255,255,255,0.18))",
              }}
            />
          </div>
        </div>

        <span data-eyebrow className="eyebrow hidden text-right md:inline">
          Ottawa → Montreal · 200 km
        </span>
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
          <Link data-hero-cta href="/donate" className="pill-cta bg-accent text-accent-foreground hover:shadow-[0_18px_60px_rgba(200,226,92,0.3)]">
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
        <div className="flex items-center gap-4 md:gap-6">
          <Link
            href="/donate"
            className="group inline-flex items-center gap-2 text-[0.7rem] font-medium uppercase tracking-[0.28em] text-foreground transition hover:text-accent"
          >
            Donate
            <span
              aria-hidden
              className="inline-block h-px w-6 bg-foreground transition-all duration-300 group-hover:w-10 group-hover:bg-accent"
            />
          </Link>
          <span aria-hidden className="hidden h-3 w-px bg-white/15 md:inline-block" />
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
      </div>
    </section>
  );
}
