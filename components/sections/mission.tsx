"use client";

import Image from "next/image";

import { usePrefersReducedMotion } from "@/hooks/use-prefers-reduced-motion";
import { useScrollProgress } from "@/hooks/use-scroll-progress";
import type { WhyItMattersContent } from "@/lib/fallback-content";

export function MissionSection({ whyItMatters }: { whyItMatters: WhyItMattersContent }) {
  const { ref, progress } = useScrollProgress<HTMLElement>({ end: 1.6 });
  const prefersReducedMotion = usePrefersReducedMotion();
  const animationProgress = prefersReducedMotion ? 1 : progress;

  return (
    <section ref={ref} className="relative bg-foreground text-background">
      <div className="sticky top-0 h-screen overflow-hidden">
        <div className="relative h-full">
          <Image src={whyItMatters.image.src} alt={whyItMatters.image.alt} fill className="object-cover" />
          <div className="absolute inset-0 bg-black/45" />
          <div className="absolute inset-0 px-6 py-20 md:px-12 lg:px-20">
            <div className="mx-auto flex h-full max-w-7xl flex-col justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.28em] text-white/65">{whyItMatters.eyebrow}</p>
                <h2 className="mt-6 max-w-5xl text-5xl font-medium leading-[0.94] tracking-tight md:text-7xl">
                  {whyItMatters.title.split(" ").map((word, index) => {
                    const start = index * 0.06;
                    const wordProgress = Math.max(0, Math.min(1, (animationProgress - start) / 0.18));
                    return (
                      <span
                        key={`${word}-${index}`}
                        className="inline-block pr-[0.28em]"
                        style={{
                          opacity: 1 - wordProgress,
                          filter: `blur(${wordProgress * 10}px)`,
                        }}
                      >
                        {word}
                      </span>
                    );
                  })}
                </h2>
              </div>
              <div className="max-w-4xl">
                <p className="text-3xl font-medium leading-tight tracking-tight text-white/95 md:text-5xl">
                  {whyItMatters.body.split(" ").map((word, index, words) => {
                    const threshold = index / words.length;
                    return (
                      <span
                        key={`${word}-${index}`}
                        style={{
                          color: animationProgress > threshold ? "rgba(255,255,255,0.96)" : "rgba(255,255,255,0.32)",
                        }}
                      >
                        {word}
                        {index < words.length - 1 ? " " : ""}
                      </span>
                    );
                  })}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[160vh]" />
    </section>
  );
}
