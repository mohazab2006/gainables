"use client";

import Image from "next/image";
import { Heart, Quote } from "lucide-react";

import { useReveal } from "@/hooks/use-reveal";
import type { CausePartnerContent } from "@/lib/fallback-content";

export function CausePartnerSection({ causePartner }: { causePartner: CausePartnerContent }) {
  const ref = useReveal<HTMLDivElement>({ y: 30, stagger: 0.1 });

  return (
    <section className="bg-background px-6 py-24 md:px-12 md:py-28 lg:px-20">
      <div ref={ref} className="container-shell grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div
          data-reveal
          className="relative overflow-hidden rounded-[2rem] border border-foreground/10 bg-foreground p-8 text-background md:p-12"
        >
          <Quote
            size={120}
            strokeWidth={1}
            className="absolute -right-6 -top-6 text-accent/15"
            aria-hidden
          />
          <p className="ring-token border-white/15 bg-white/10 text-white/80">{causePartner.eyebrow}</p>
          <blockquote className="mt-8 font-display text-3xl leading-[1.12] tracking-[-0.02em] md:text-5xl">
            <span className="display-italic text-accent">“</span>
            {causePartner.quote}
            <span className="display-italic text-accent">”</span>
          </blockquote>
          <p className="mt-8 max-w-xl text-base leading-7 text-background/72 md:text-lg md:leading-8">
            {causePartner.body}
          </p>
          <div className="mt-10 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.24em] text-background/75">
            <Heart size={14} className="text-accent" />
            100% supports the cause
          </div>
        </div>
        <div data-reveal className="relative min-h-[420px] overflow-hidden rounded-[2rem] md:min-h-[520px]">
          <Image src={causePartner.image.src} alt={causePartner.image.alt} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        </div>
      </div>
    </section>
  );
}
