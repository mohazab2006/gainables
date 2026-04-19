"use client";

import { useRef } from "react";

import { gsap, ScrollTrigger, useGSAP } from "@/lib/gsap";
import type { WhyItMattersContent } from "@/lib/fallback-content";

export function MissionSection({ whyItMatters }: { whyItMatters: WhyItMattersContent }) {
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
          if (reduce) {
            gsap.set("[data-mission-word]", { color: "#000000" });
            return;
          }

          gsap.to("[data-mission-word]", {
            color: "#000000",
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-mission-body]",
              start: "top 80%",
              end: "bottom 60%",
              scrub: true,
            },
          });

          gsap.fromTo(
            "[data-mission-headline] [data-word]",
            { yPercent: 110, autoAlpha: 0 },
            {
              yPercent: 0,
              autoAlpha: 1,
              duration: 1,
              ease: "expo.out",
              stagger: 0.06,
              scrollTrigger: { trigger: root.current, start: "top 70%" },
            },
          );

          ScrollTrigger.refresh();
        },
      );

      return () => mm.revert();
    },
    { scope: root },
  );

  const bodyWords = whyItMatters.body.split(/(\s+)/);
  const titleWords = whyItMatters.title.toUpperCase().split(/\s+/);

  return (
    <section
      ref={root}
      id="mission"
      className="relative overflow-hidden border-t border-foreground bg-background text-foreground"
    >
      <div className="px-6 py-24 md:px-10 md:py-36 lg:py-48">
        <div className="container-shell flex flex-col gap-16 md:gap-24">
          <div>
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              {whyItMatters.eyebrow}
            </p>
            <h2
              data-mission-headline
              className="mt-6 max-w-6xl font-display text-6xl leading-[0.9] md:text-8xl lg:text-[8vw]"
            >
              {titleWords.map((word, index) => (
                <span key={`${word}-${index}`} className="mr-[0.18em] inline-block overflow-hidden align-bottom">
                  <span data-word className="inline-block">
                    {word}
                  </span>
                </span>
              ))}
            </h2>
          </div>

          <p
            data-mission-body
            className="max-w-6xl font-display text-3xl leading-[1.1] md:text-5xl lg:text-[3.6vw]"
          >
            {bodyWords.map((segment, index) => {
              if (/^\s+$/.test(segment)) return <span key={index}>{segment}</span>;
              return (
                <span
                  key={index}
                  data-mission-word
                  className="inline-block"
                  style={{ color: "#D9D9D9" }}
                >
                  {segment.toUpperCase()}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
