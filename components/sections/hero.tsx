"use client";

import { useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, MapPin } from "lucide-react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { HeroContent, StatItem } from "@/lib/fallback-content";

type HeroSectionProps = {
  hero: HeroContent;
  stats: StatItem[];
};

export function HeroSection({ hero, stats }: HeroSectionProps) {
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

          gsap.set("[data-hero-rail]", { autoAlpha: 0, y: 60 });
          gsap.set("[data-hero-word]", { yPercent: 110, rotate: 4, autoAlpha: 0 });
          gsap.set("[data-hero-eyebrow]", { autoAlpha: 0, y: 16 });
          gsap.set("[data-hero-meta]", { autoAlpha: 0, y: 24 });
          gsap.set("[data-hero-cta]", { autoAlpha: 0, y: 16 });
          gsap.set("[data-hero-stat]", { autoAlpha: 0, y: 24 });
          gsap.set("[data-hero-image]", { scale: reduce ? 1 : 1.18, autoAlpha: reduce ? 1 : 0.001 });

          const tl = gsap.timeline({
            defaults: { ease: "power3.out", duration: reduce ? 0 : 1 },
          });

          tl.to("[data-hero-image]", { autoAlpha: 1, scale: 1, duration: reduce ? 0 : 1.6, ease: "expo.out" })
            .to("[data-hero-eyebrow]", { autoAlpha: 1, y: 0, duration: 0.6 }, "-=1.0")
            .to(
              "[data-hero-word]",
              {
                yPercent: 0,
                rotate: 0,
                autoAlpha: 1,
                duration: 1,
                ease: "expo.out",
                stagger: reduce ? 0 : 0.07,
              },
              "-=0.85",
            )
            .to("[data-hero-meta]", { autoAlpha: 1, y: 0, duration: 0.7 }, "-=0.55")
            .to("[data-hero-cta]", { autoAlpha: 1, y: 0, duration: 0.6, stagger: 0.08 }, "-=0.55")
            .to("[data-hero-rail]", { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.1 }, "-=0.7");

          if (!reduce) {
            gsap.to("[data-hero-image]", {
              yPercent: 12,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });
            gsap.to("[data-hero-rail='left']", {
              yPercent: -10,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });
            gsap.to("[data-hero-rail='right']", {
              yPercent: -18,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            });
          }

          gsap.fromTo(
            "[data-hero-stat]",
            { autoAlpha: 0, y: 28 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.8,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: { trigger: "[data-hero-stats]", start: "top 82%" },
            },
          );

          ScrollTrigger.refresh();
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
      className="relative isolate overflow-hidden bg-background pt-28 pb-20 md:pt-32 md:pb-28"
    >
      <div className="container-shell relative px-4 md:px-6">
        <div className="grid gap-4 md:grid-cols-[0.18fr_0.64fr_0.18fr]">
          <SideRail images={hero.sideImages.slice(0, 2)} side="left" />

          <div className="relative overflow-hidden rounded-[2rem] bg-foreground md:rounded-[2.5rem]">
            <div className="relative aspect-[4/5] w-full md:aspect-[16/19] lg:aspect-[16/17]">
              <div data-hero-image className="absolute inset-0 will-change-transform">
                <Image
                  src={hero.primaryImage.src}
                  alt={hero.primaryImage.alt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/85" />
              </div>

              <div className="absolute inset-x-0 top-0 flex items-center justify-between px-6 pt-6 md:px-10 md:pt-8">
                <div data-hero-eyebrow className="ring-token border-white/25 bg-white/10 text-white/85">
                  <MapPin size={14} />
                  <span>{hero.eyebrow}</span>
                </div>
                <div data-hero-eyebrow className="ring-token hidden border-white/25 bg-white/10 text-white/80 md:inline-flex">
                  Ottawa <span className="opacity-60">→</span> Montreal · 200 km
                </div>
              </div>

              <div className="absolute inset-x-0 bottom-0 flex flex-col gap-8 px-6 pb-8 md:px-10 md:pb-12 lg:px-14 lg:pb-16">
                <h1 className="font-display text-[14vw] leading-[0.86] tracking-[-0.04em] text-white md:text-[10vw] lg:text-[8.4vw]">
                  {titleWords.map((word, index) => (
                    <span key={`${word}-${index}`} className="mr-[0.18em] inline-block overflow-hidden align-bottom">
                      <span data-hero-word className="inline-block">
                        {word}
                      </span>
                    </span>
                  ))}
                </h1>

                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
                  <p
                    data-hero-meta
                    className="max-w-2xl font-sans text-base leading-7 text-white/85 md:text-lg"
                  >
                    {hero.description}
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      data-hero-cta
                      href={hero.primaryCta.href}
                      className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-7 py-3.5 text-sm font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(200,226,92,0.45)]"
                    >
                      {hero.primaryCta.label}
                      <ArrowUpRight size={16} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                    </Link>
                    <Link
                      data-hero-cta
                      href={hero.secondaryCta.href}
                      className="inline-flex items-center justify-center gap-2 rounded-full border border-white/25 bg-white/5 px-7 py-3.5 text-sm font-medium text-white backdrop-blur transition hover:bg-white/15"
                    >
                      {hero.secondaryCta.label}
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <SideRail images={hero.sideImages.slice(2, 4)} side="right" />
        </div>

        <div data-hero-stats className="mt-14 grid gap-6 md:mt-20 lg:grid-cols-[1.1fr_1fr]">
          <p className="max-w-2xl font-display text-3xl leading-[1.04] tracking-[-0.02em] md:text-5xl">
            Every kilometer becomes a conversation about <span className="display-italic">access, recovery,</span> and community care.
          </p>
          <div className="grid gap-3 sm:grid-cols-3">
            {stats.map((stat) => (
              <div
                key={stat.label}
                data-hero-stat
                className="rounded-2xl border border-border bg-surface p-5 transition hover:-translate-y-0.5 hover:shadow-[0_18px_60px_rgba(14,14,12,0.06)]"
              >
                <p className="eyebrow">{stat.label}</p>
                <p className="mt-3 font-display text-3xl tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function SideRail({ images, side }: { images: HeroContent["sideImages"]; side: "left" | "right" }) {
  return (
    <div className="hidden flex-col gap-4 md:flex" data-hero-rail={side}>
      {images.map((image, idx) => (
        <div
          key={image.src + idx}
          className="relative flex-1 overflow-hidden rounded-[2rem] bg-secondary"
          style={{ minHeight: "min(36vh, 320px)" }}
        >
          <Image
            src={image.src}
            alt={image.alt}
            fill
            sizes="20vw"
            className="object-cover transition-transform duration-700 hover:scale-105"
          />
        </div>
      ))}
    </div>
  );
}
