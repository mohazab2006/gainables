"use client";

import { useRef } from "react";

import { gsap, useGSAP } from "@/lib/gsap";
import type { StatItem } from "@/lib/fallback-content";

function parseStat(value: string): { number: number | null; prefix: string; suffix: string } {
  const match = value.match(/^([^0-9-]*)([-+]?\d+(?:[.,]\d+)?)(.*)$/);
  if (!match) return { number: null, prefix: "", suffix: value };
  const numeric = Number(match[2].replace(",", "."));
  if (Number.isNaN(numeric)) return { number: null, prefix: "", suffix: value };
  return { number: numeric, prefix: match[1] ?? "", suffix: match[3] ?? "" };
}

export function StatsSection({ stats }: { stats: StatItem[] }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(
        { motionOk: "(prefers-reduced-motion: no-preference)", reduce: "(prefers-reduced-motion: reduce)" },
        (ctx) => {
          if (!root.current) return;
          const reduce = ctx.conditions?.reduce;

          gsap.fromTo(
            "[data-stats-head]",
            { autoAlpha: 0, y: 24 },
            { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08, scrollTrigger: { trigger: root.current, start: "top 75%" } },
          );
          gsap.fromTo(
            "[data-stat-card]",
            { autoAlpha: 0, y: 40 },
            {
              autoAlpha: 1,
              y: 0,
              duration: 0.9,
              stagger: 0.1,
              ease: "power3.out",
              scrollTrigger: { trigger: "[data-stat-grid]", start: "top 80%" },
            },
          );

          if (reduce) return;

          root.current.querySelectorAll<HTMLElement>("[data-stat-number]").forEach((el) => {
            const target = Number(el.dataset.target ?? "0");
            const decimals = el.dataset.decimals ? Number(el.dataset.decimals) : 0;
            const obj = { v: 0 };
            gsap.to(obj, {
              v: target,
              duration: 1.6,
              ease: "expo.out",
              scrollTrigger: { trigger: el, start: "top 85%" },
              onUpdate: () => {
                el.textContent = obj.v.toLocaleString(undefined, {
                  minimumFractionDigits: decimals,
                  maximumFractionDigits: decimals,
                });
              },
            });
          });
        },
      );
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="grain-bg bg-foreground px-6 py-24 text-background md:px-12 md:py-32 lg:px-20">
      <div className="container-shell">
        <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr]">
          <div data-stats-head>
            <p className="ring-token border-white/15 bg-white/10 text-white/75">Ride snapshot</p>
            <h2 className="mt-5 max-w-md font-display text-4xl leading-[1.02] tracking-[-0.025em] md:text-6xl">
              Urgency, clarity, and <span className="display-italic">live</span> signals.
            </h2>
            <p className="mt-6 max-w-md text-base leading-7 text-background/72">
              Every section earns its place. The site behaves like a campaign hub — not a static brochure.
            </p>
          </div>
          <div data-stat-grid className="grid gap-4 sm:grid-cols-2">
            {stats.map((stat) => {
              const parsed = parseStat(stat.value);
              return (
                <div
                  key={stat.label}
                  data-stat-card
                  className="rounded-[1.75rem] border border-white/10 bg-white/5 p-7 transition hover:bg-white/[0.07]"
                >
                  <p className="text-[0.7rem] uppercase tracking-[0.24em] text-background/55">{stat.label}</p>
                  <p className="mt-5 font-display text-5xl leading-none tracking-tight md:text-6xl">
                    {parsed.number !== null ? (
                      <>
                        {parsed.prefix}
                        <span data-stat-number data-target={parsed.number}>0</span>
                        {parsed.suffix}
                      </>
                    ) : (
                      stat.value
                    )}
                  </p>
                  <p className="mt-4 max-w-sm text-sm leading-7 text-background/70">{stat.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
