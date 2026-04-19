"use client";

import { useRef } from "react";

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
          { autoAlpha: 0, y: 28 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            ease: "power3.out",
            scrollTrigger: { trigger: root.current, start: "top 70%" },
          },
        );

        const path = root.current.querySelector<SVGPathElement>("[data-route-path]");
        if (path) {
          const length = path.getTotalLength();
          gsap.set(path, { strokeDasharray: length, strokeDashoffset: length });
          gsap.to(path, {
            strokeDashoffset: 0,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-route-svg]",
              start: "top 80%",
              end: "bottom 60%",
              scrub: true,
            },
          });
        }

      });
      return () => mm.revert();
    },
    { scope: root },
  );

  // First and last checkpoints provide the primary endpoint labels.
  const start = route.checkpoints[0];
  const end = route.checkpoints[route.checkpoints.length - 1];

  return (
    <section
      ref={root}
      id="route"
      className="relative overflow-hidden border-t border-foreground bg-background text-foreground"
    >
      <div className="px-6 py-24 md:px-10 md:py-36">
        <div className="container-shell">
          <div data-route-reveal className="flex flex-col gap-3">
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              {about.eyebrow}
            </p>
            <h2 className="max-w-5xl font-display text-6xl leading-[0.92] md:text-8xl lg:text-[7vw]">
              OTTAWA
              <span className="display-italic mx-4 inline-block align-middle text-3xl md:text-5xl">
                &rarr;
              </span>
              MONTREAL
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
              {route.summary}
            </p>
          </div>

          <div data-route-reveal className="mt-16 md:mt-24">
            <div className="relative w-full">
              <svg
                data-route-svg
                viewBox="0 0 1000 220"
                preserveAspectRatio="none"
                className="h-[180px] w-full md:h-[260px] lg:h-[320px]"
                aria-hidden
              >
                <path
                  data-route-path
                  d="M 30 90 C 200 30, 380 230, 560 130 S 880 60, 970 160"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                {/* Endpoint dots */}
                <circle cx="30" cy="90" r="6" fill="currentColor" />
                <circle cx="970" cy="160" r="6" fill="currentColor" />
              </svg>

              {/* Endpoint labels positioned over the SVG */}
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute left-0 top-0 -translate-y-full pb-3">
                  <p className="font-display text-2xl leading-none md:text-4xl">{start.name.toUpperCase()}</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground">
                    Start &middot; 0 km
                  </p>
                </div>
                <div className="absolute right-0 bottom-0 translate-y-full pt-3 text-right">
                  <p className="font-display text-2xl leading-none md:text-4xl">{end.name.toUpperCase()}</p>
                  <p className="mt-1 text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground">
                    Finish &middot; {route.totalDistanceKm} km
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div data-route-reveal className="mt-20 grid gap-8 border-t border-foreground pt-10 md:grid-cols-4">
            {route.checkpoints.map((cp) => (
              <div key={cp.name}>
                <p className="text-[0.65rem] uppercase tracking-[0.32em] text-muted-foreground">
                  {cp.stage}
                </p>
                <p className="mt-3 font-display text-2xl leading-none md:text-3xl">
                  {cp.name.toUpperCase()}
                </p>
                <p className="mt-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {cp.distanceLabel}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
