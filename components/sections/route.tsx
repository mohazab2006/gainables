"use client";

import { useRef } from "react";
import { Bike, MapPin, Navigation, Route as RouteIcon } from "lucide-react";

import { gsap, useGSAP } from "@/lib/gsap";
import type { AboutContent, RouteContent } from "@/lib/fallback-content";

export function RouteSection({ about, route }: { about: AboutContent; route: RouteContent }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!root.current) return;
        gsap.fromTo(
          "[data-route-reveal]",
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top 75%" },
          },
        );

        gsap.fromTo(
          "[data-route-line]",
          { scaleY: 0 },
          {
            scaleY: 1,
            transformOrigin: "top center",
            ease: "none",
            scrollTrigger: {
              trigger: "[data-route-checkpoints]",
              start: "top 75%",
              end: "bottom 70%",
              scrub: true,
            },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-background px-6 py-24 md:px-12 md:py-32 lg:px-20">
      <div className="container-shell grid gap-6 lg:grid-cols-2">
        <article className="rounded-[2rem] border border-border bg-surface p-8 md:p-10" data-route-reveal>
          <p className="eyebrow">{about.eyebrow}</p>
          <h2 className="mt-5 max-w-xl font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-5xl">
            {about.title}
          </h2>
          <p className="mt-6 max-w-2xl text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
            {about.body}
          </p>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            {about.highlights.map((highlight) => (
              <div
                key={highlight.label}
                data-route-reveal
                className="rounded-2xl border border-border bg-background p-5 transition hover:-translate-y-0.5"
              >
                <p className="eyebrow">{highlight.label}</p>
                <p className="mt-3 font-display text-xl tracking-tight">{highlight.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article
          data-route-reveal
          className="grain-bg relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-foreground p-8 text-background md:p-10"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="ring-token border-white/20 bg-white/10 text-white/80">{route.eyebrow}</p>
              <h2 className="mt-5 max-w-md font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-5xl">
                {route.title}
              </h2>
            </div>
            <div className="hidden flex-col items-end gap-1 text-right sm:flex">
              <p className="text-xs uppercase tracking-[0.24em] text-background/55">Total</p>
              <p className="font-display text-4xl leading-none tracking-tight">{route.totalDistanceKm} <span className="text-xl text-background/60">km</span></p>
            </div>
          </div>

          <p className="mt-6 max-w-xl text-sm leading-7 text-background/72 md:text-base md:leading-8">
            {route.summary}
          </p>

          <div className="relative mt-10" data-route-checkpoints>
            <div className="absolute left-[14px] top-2 bottom-2 w-px bg-white/15" />
            <div data-route-line className="absolute left-[14px] top-2 bottom-2 w-px bg-accent" />
            <ul className="space-y-5">
              {route.checkpoints.map((checkpoint, idx) => {
                const Icon = idx === 0 ? Bike : idx === route.checkpoints.length - 1 ? MapPin : Navigation;
                return (
                  <li key={checkpoint.name} data-route-reveal className="relative pl-12">
                    <div className="absolute left-0 top-0 flex h-8 w-8 items-center justify-center rounded-full border border-white/20 bg-foreground text-background">
                      <Icon size={14} className="text-accent" />
                    </div>
                    <div className="flex items-baseline justify-between gap-4">
                      <div>
                        <p className="text-[0.7rem] uppercase tracking-[0.24em] text-background/55">{checkpoint.stage}</p>
                        <p className="mt-1 font-display text-2xl tracking-tight">{checkpoint.name}</p>
                        {checkpoint.note ? (
                          <p className="mt-2 max-w-md text-sm leading-7 text-background/70">{checkpoint.note}</p>
                        ) : null}
                      </div>
                      <span className="rounded-full border border-white/15 px-3 py-1 text-xs text-background/75">
                        {checkpoint.distanceLabel}
                      </span>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-background/70">
            <RouteIcon size={16} className="text-accent" />
            One day. Four checkpoints. One shared cause.
          </div>
        </article>
      </div>
    </section>
  );
}
