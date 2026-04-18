"use client";

import Link from "next/link";
import { useRef } from "react";
import { ArrowUpRight, MapPin, Radio } from "lucide-react";

import { gsap, useGSAP } from "@/lib/gsap";
import type { RideUpdate } from "@/lib/fallback-content";
import { formatRideUpdateDate } from "@/lib/track";

export function TrackingPreviewSection({
  update,
  routeTotalDistanceKm = 200,
  trackerEmbedUrl,
  donationUrl,
}: {
  update: RideUpdate;
  routeTotalDistanceKm?: number;
  trackerEmbedUrl?: string | null;
  donationUrl: string;
}) {
  const root = useRef<HTMLElement>(null);
  const completion = Math.min((update.kmCompleted / routeTotalDistanceKm) * 100, 100);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        if (!root.current) return;
        gsap.fromTo(
          "[data-track-reveal]",
          { autoAlpha: 0, y: 30 },
          {
            autoAlpha: 1,
            y: 0,
            duration: 0.9,
            stagger: 0.08,
            scrollTrigger: { trigger: root.current, start: "top 78%" },
          },
        );
        gsap.fromTo(
          "[data-track-bar]",
          { scaleX: 0 },
          {
            scaleX: completion / 100,
            transformOrigin: "left center",
            duration: 1.4,
            ease: "expo.out",
            scrollTrigger: { trigger: "[data-track-bar]", start: "top 85%" },
          },
        );
      });
      return () => mm.revert();
    },
    { scope: root },
  );

  return (
    <section ref={root} className="bg-background px-6 py-24 md:px-12 md:py-28 lg:px-20">
      <div className="container-shell grid gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div data-track-reveal className="rounded-[2rem] border border-border bg-surface p-8 md:p-10">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="ring-token">
                <Radio size={14} className="text-accent" /> Live preview
              </p>
              <h2 className="mt-5 max-w-xl font-display text-4xl leading-[1.04] tracking-[-0.02em] md:text-5xl">
                Ride-day status, readable in <span className="display-italic">a glance</span>.
              </h2>
            </div>
            <div className="rounded-2xl border border-border bg-background px-4 py-3 text-right">
              <p className="text-[0.65rem] uppercase tracking-[0.24em] text-muted-foreground">Updated</p>
              <p className="mt-1 text-sm font-medium">{formatRideUpdateDate(update.createdAt)}</p>
            </div>
          </div>

          <div data-track-reveal className="mt-8 rounded-2xl border border-border bg-background p-6">
            <div className="flex items-end justify-between gap-4">
              <div>
                <p className="eyebrow">Ride progress</p>
                <p className="mt-2 font-display text-5xl tracking-tight">{Math.round(completion)}%</p>
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-medium text-foreground">{update.kmCompleted}</span> / {routeTotalDistanceKm} km
              </p>
            </div>
            <div className="mt-5 h-2 overflow-hidden rounded-full bg-secondary">
              <div data-track-bar className="h-full w-full origin-left rounded-full bg-foreground" />
            </div>
          </div>

          <h3 data-track-reveal className="mt-10 eyebrow">Latest ride details</h3>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <Stat label="Current location" value={update.location} />
            <Stat label="Next checkpoint" value={update.nextCheckpoint} />
            <Stat label="Latest note" value={update.message} className="sm:col-span-2" />
          </div>
          <div data-track-reveal className="mt-8 flex flex-wrap gap-3">
            <Link href="/track" className="pill-cta">
              Open live tracker
              <ArrowUpRight size={16} />
            </Link>
            <Link href={donationUrl} target="_blank" rel="noreferrer" className="pill-ghost">
              Support the ride
            </Link>
          </div>
        </div>

        <div data-track-reveal className="grain-bg overflow-hidden rounded-[2rem] border border-foreground/10 bg-foreground p-3">
          {trackerEmbedUrl ? (
            <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-background">
              <iframe title="Tracker preview" src={trackerEmbedUrl} className="h-full w-full border-0" loading="lazy" />
            </div>
          ) : (
            <div className="relative flex aspect-[4/3] flex-col justify-between rounded-[1.5rem] bg-neutral-950 p-8 text-white">
              <div className="absolute inset-0 opacity-40 [background-image:radial-gradient(circle_at_30%_20%,rgba(200,226,92,0.18),transparent_60%),radial-gradient(circle_at_80%_70%,rgba(255,255,255,0.08),transparent_60%)]" />
              <div className="relative">
                <p className="ring-token border-white/20 bg-white/10 text-white/80">
                  <MapPin size={14} className="text-accent" /> GPS feed placeholder
                </p>
                <h3 className="mt-5 max-w-md font-display text-3xl leading-tight tracking-tight">
                  Mapbox + realtime updates drop in here on ride day.
                </h3>
              </div>
              <p className="relative max-w-md text-sm leading-7 text-white/70">
                Set <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">tracker_embed_url</code> for an instant
                fallback iframe, or supply <code className="rounded bg-white/10 px-1.5 py-0.5 text-xs">NEXT_PUBLIC_MAPBOX_TOKEN</code>
                for the live route view.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div data-track-reveal className={`rounded-2xl border border-border bg-background p-5 ${className ?? ""}`}>
      <p className="eyebrow">{label}</p>
      <p className="mt-3 text-base leading-7 font-medium">{value}</p>
    </div>
  );
}
