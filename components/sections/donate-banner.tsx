"use client";

import Link from "next/link";
import { ArrowUpRight, HeartHandshake } from "lucide-react";

import { useReveal } from "@/hooks/use-reveal";
import type { DonateContent } from "@/lib/fallback-content";

export function DonateBannerSection({
  donate,
  donationUrl,
}: {
  donate: DonateContent;
  donationUrl: string;
}) {
  const ref = useReveal<HTMLDivElement>({ y: 30, stagger: 0.08 });

  return (
    <section className="bg-background px-6 py-12 md:px-12 lg:px-20">
      <div ref={ref} className="container-shell">
        <div
          data-reveal
          className="grain-bg relative overflow-hidden rounded-[2.25rem] bg-foreground px-8 py-12 text-background md:px-14 md:py-16"
        >
          <div
            aria-hidden
            className="pointer-events-none absolute -right-32 -top-32 h-96 w-96 rounded-full bg-accent/35 blur-3xl"
          />
          <div className="relative grid gap-10 md:grid-cols-[1.3fr_0.7fr] md:items-end">
            <div data-reveal>
              <p className="ring-token border-white/15 bg-white/10 text-white/80">
                <HeartHandshake size={14} className="text-accent" /> Support the cause
              </p>
              <h2 className="mt-6 max-w-3xl font-display text-4xl leading-[1.02] tracking-[-0.025em] md:text-6xl">
                {donate.bannerTitle}
              </h2>
              <p className="mt-6 max-w-2xl text-base leading-7 text-background/80 md:text-lg md:leading-8">
                {donate.bannerBody}
              </p>
            </div>
            <div data-reveal className="flex flex-col gap-4 md:items-end">
              <Link
                href={donationUrl}
                target="_blank"
                rel="noreferrer"
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-accent px-8 py-4 text-base font-medium text-foreground transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_22px_60px_rgba(200,226,92,0.45)]"
              >
                Donate now
                <ArrowUpRight size={18} className="transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 text-sm text-background/70 transition hover:text-background"
              >
                See where funds go
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
