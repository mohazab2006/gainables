"use client";

import { useRef } from "react";
import Image from "next/image";

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
            gsap.set("[data-mission-word]", { color: "rgba(255,255,255,0.95)" });
            return;
          }

          gsap.fromTo(
            "[data-mission-image]",
            { scale: 1.15 },
            {
              scale: 1,
              ease: "none",
              scrollTrigger: {
                trigger: root.current,
                start: "top top",
                end: "bottom top",
                scrub: true,
              },
            },
          );

          gsap.to("[data-mission-word]", {
            color: "rgba(255,255,255,0.96)",
            stagger: 0.04,
            ease: "none",
            scrollTrigger: {
              trigger: "[data-mission-body]",
              start: "top 75%",
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
              scrollTrigger: { trigger: root.current, start: "top 60%" },
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
  const titleWords = whyItMatters.title.split(/\s+/);

  return (
    <section ref={root} className="relative overflow-hidden bg-foreground text-background">
      <div className="absolute inset-0">
        <div data-mission-image className="absolute inset-0 will-change-transform">
          <Image src={whyItMatters.image.src} alt={whyItMatters.image.alt} fill className="object-cover" />
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/40 to-black/85" />
      </div>

      <div className="relative px-6 py-28 md:px-12 md:py-36 lg:px-20 lg:py-44">
        <div className="container-shell flex flex-col gap-24 md:gap-36">
          <div>
            <p className="ring-token border-white/25 bg-white/10 text-white/85">{whyItMatters.eyebrow}</p>
            <h2
              data-mission-headline
              className="mt-8 max-w-5xl font-display text-5xl leading-[0.95] tracking-[-0.03em] md:text-7xl lg:text-[6vw]"
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
            className="max-w-5xl font-display text-3xl leading-[1.18] tracking-[-0.015em] md:text-5xl lg:text-[3.6vw]"
          >
            {bodyWords.map((segment, index) => {
              if (/^\s+$/.test(segment)) return <span key={index}>{segment}</span>;
              return (
                <span
                  key={index}
                  data-mission-word
                  className="inline-block"
                  style={{ color: "rgba(255,255,255,0.28)" }}
                >
                  {segment}
                </span>
              );
            })}
          </p>
        </div>
      </div>
    </section>
  );
}
