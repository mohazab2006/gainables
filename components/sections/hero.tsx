"use client";

import Image from "next/image";
import Link from "next/link";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import type { HeroContent, StatItem } from "@/lib/fallback-content";

type HeroSectionProps = {
  hero: HeroContent;
  stats: StatItem[];
};

export function HeroSection({ hero, stats }: HeroSectionProps) {
  const { ref, progress } = useScrollProgress<HTMLElement>({ end: 1.8 });
  const prefersReducedMotion = usePrefersReducedMotion();
  const animationProgress = prefersReducedMotion ? 1 : progress;
  const textOpacity = Math.max(0, 1 - animationProgress / 0.26);
  const cardProgress = Math.max(0, Math.min(1, (animationProgress - 0.16) / 0.84));

  return (
    <section id="ride" ref={ref} className="relative bg-background">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div
          className="relative grid h-full grid-cols-1 gap-4 px-4 pb-6 pt-24 md:grid-cols-[0.22fr_0.56fr_0.22fr] md:px-6"
          style={{
            gap: `${16 * cardProgress}px`,
            paddingInline: `${16 + 8 * cardProgress}px`,
            paddingBottom: `${24 + 24 * cardProgress}px`,
          }}
        >
          <SideRail
            images={hero.sideImages.slice(0, 2)}
            direction="left"
            progress={cardProgress}
            prefersReducedMotion={prefersReducedMotion}
          />
          <div
            className="relative min-h-[70vh] overflow-hidden rounded-[1.8rem] bg-foreground md:min-h-0"
            style={{
              borderRadius: `${24 * cardProgress}px`,
              transform: prefersReducedMotion ? undefined : `scale(${1 - cardProgress * 0.06})`,
            }}
          >
            <Image src={hero.primaryImage.src} alt={hero.primaryImage.alt} fill priority className="object-cover" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-black/25 to-black/75" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-10 lg:p-14">
              <div style={{ opacity: textOpacity }}>
                <p className="text-sm uppercase tracking-[0.32em] text-white/70">{hero.eyebrow}</p>
                <h1 className="mt-4 text-[17vw] font-medium leading-[0.82] tracking-[-0.08em] text-white md:text-[11vw]">
                  {hero.title}
                </h1>
              </div>
              <div className="mt-6 flex flex-col gap-4 md:mt-8 md:flex-row md:items-center md:justify-between">
                <p className="max-w-2xl text-base leading-7 text-white/82 md:text-lg">{hero.description}</p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    href={hero.primaryCta.href}
                    className="rounded-full bg-white px-6 py-3 text-sm font-medium text-foreground transition hover:bg-white/90"
                  >
                    {hero.primaryCta.label}
                  </Link>
                  <Link
                    href={hero.secondaryCta.href}
                    className="rounded-full border border-white/25 px-6 py-3 text-sm font-medium text-white transition hover:bg-white/10"
                  >
                    {hero.secondaryCta.label}
                  </Link>
                </div>
              </div>
            </div>
          </div>
          <SideRail
            images={hero.sideImages.slice(2)}
            direction="right"
            progress={cardProgress}
            prefersReducedMotion={prefersReducedMotion}
          />
        </div>
      </div>
      <div className="h-[180vh]" />
      <div className="px-6 pb-24 pt-8 md:px-12 lg:px-20">
        <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <p className="max-w-2xl text-3xl font-medium leading-tight tracking-tight md:text-5xl">
            Every kilometer becomes a conversation about mental health access, recovery, and community care.
          </p>
          <div className="grid gap-4 sm:grid-cols-3">
            {stats.map((stat) => (
              <div key={stat.label} className="rounded-[2rem] border border-border bg-secondary/60 p-6">
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">{stat.label}</p>
                <p className="mt-4 text-3xl font-medium tracking-tight">{stat.value}</p>
                <p className="mt-2 text-sm leading-7 text-muted-foreground">{stat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

type SideRailProps = {
  direction: "left" | "right";
  images: HeroContent["sideImages"];
  progress: number;
  prefersReducedMotion: boolean;
};

function SideRail({ direction, images, progress, prefersReducedMotion }: SideRailProps) {
  const translateX = direction === "left" ? -100 + progress * 100 : 100 - progress * 100;

  return (
    <div
      className="hidden flex-col gap-4 md:flex"
      style={{
        opacity: progress,
        transform: prefersReducedMotion ? undefined : `translateX(${translateX}%) translateY(${-12 * progress}%)`,
      }}
    >
      {images.map((image) => (
        <div key={image.src} className="relative min-h-[33vh] flex-1 overflow-hidden rounded-[1.8rem]">
          <Image src={image.src} alt={image.alt} fill className="object-cover" />
        </div>
      ))}
    </div>
  );
}
