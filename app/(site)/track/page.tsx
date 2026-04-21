import type { Metadata } from "next";
import Link from "next/link";
import { ArrowUpRight, HeartHandshake, Mail } from "lucide-react";

import { DonateFloat } from "@/components/track/donate-float";
import { TrackerShell } from "@/components/track/tracker-shell";
import { getRidePositions, getRideUpdates, getSiteContent } from "@/lib/content";
import { getRouteGeoJson } from "@/lib/route-geojson";

export const metadata: Metadata = {
  title: "Live tracker",
  description:
    "Follow the Gainables Ride for Mental Health in real time — live location, checkpoint progress, and ride-day updates from Ottawa to Montreal.",
};

export default async function TrackPage() {
  const [content, ridePositions, rideUpdates, routeFeature] = await Promise.all([
    getSiteContent(),
    getRidePositions(),
    getRideUpdates(),
    getRouteGeoJson(),
  ]);
  const isPreRide = content.trackerStatus === "pre_ride";

  return (
    <main className="bg-background px-4 pb-20 pt-32 md:px-8 md:pt-40 lg:px-10">
      <div className="mx-auto max-w-384">
        <div className="mb-12 flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex flex-col gap-5">
            <p className="ring-token w-fit">Live tracker</p>
            <h1 className="max-w-4xl font-display text-5xl leading-[0.96] tracking-[-0.03em] md:text-7xl lg:text-[6vw]">
              Follow the Ottawa → Montreal ride <span className="display-italic">in real time</span>.
            </h1>
            <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
              Real-time location updates from the Gainables team as they cycle ~200 km from Ottawa to Montreal — with checkpoint progress, ride-day updates, and a live route map.
            </p>
          </div>

          {isPreRide ? (
            <div className="flex shrink-0 flex-wrap gap-3 lg:justify-end">
              <Link
                href="/donate"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-7 py-4 text-base font-medium text-[#0a0a0a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(200,226,92,0.35)]"
              >
                <HeartHandshake size={18} />
                Donate to the cause
              </Link>
              <Link
                href="/faq"
                className="inline-flex items-center gap-2 rounded-full border border-border px-7 py-4 text-base font-medium transition hover:border-foreground"
              >
                FAQ
              </Link>
            </div>
          ) : null}
        </div>

        <TrackerShell
          initialPositions={ridePositions}
          initialUpdates={rideUpdates}
          mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          rideDate={content.rideDate}
          route={content.route}
          routeFeature={routeFeature}
          trackerStatus={content.trackerStatus}
        />

        <section className="mt-16 grid gap-6 md:mt-20 lg:grid-cols-[1.1fr_0.9fr]">
          {!isPreRide ? (
            <article className="rounded-4xl border border-border bg-surface p-8 md:p-10">
              <p className="eyebrow">Why we ride</p>
              <h2 className="mt-5 font-display text-3xl leading-[1.05] tracking-tight md:text-4xl">
                Mental health affects everyone.
              </h2>
              <p className="mt-5 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
                Many people are dealing with stress, burnout, anxiety, and other challenges, often without visible support. This ride represents discipline, consistency, and pushing through difficulty — values that reflect the mental health journey.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  href="/donate"
                  className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(200,226,92,0.35)]"
                >
                  <HeartHandshake size={16} />
                  Donate to the cause
                </Link>
                <Link
                  href="/faq"
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:border-foreground"
                >
                  FAQ
                </Link>
              </div>
            </article>
          ) : null}

          <article className="rounded-4xl border border-foreground/10 bg-foreground p-8 text-background md:p-10">
            <p className="ring-token border-white/15 bg-white/10 text-white/80">Stay close to the ride</p>
            <h2 className="mt-5 font-display text-3xl leading-[1.05] tracking-tight md:text-4xl">
              Get ride-day updates in your inbox.
            </h2>
            <p className="mt-5 text-base leading-7 text-background/70 md:text-lg md:leading-8">
              Three emails: campaign launch, the morning the ride starts, and a recap when it&apos;s done. No spam — just the moments that matter.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/#signup"
                className="group inline-flex items-center gap-2 rounded-full bg-accent px-6 py-3 text-sm font-medium text-[#0a0a0a] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_18px_50px_rgba(200,226,92,0.35)]"
              >
                <Mail size={16} />
                Join the waitlist
                <ArrowUpRight size={14} className="transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-6 py-3 text-sm font-medium text-background transition hover:border-white/30 hover:bg-white/10"
              >
                Back to home
              </Link>
            </div>
          </article>
        </section>
      </div>
      {!isPreRide ? <DonateFloat /> : null}
    </main>
  );
}
