import type { Metadata } from "next";
import Link from "next/link";

import { TrackerReadiness } from "@/components/operations/tracker-readiness";
import { DonateFloat } from "@/components/track/donate-float";
import { TrackerShell } from "@/components/track/tracker-shell";
import { getRidePositions, getRideUpdates, getSiteContent, getSponsors } from "@/lib/content";
import { getTrackerReadiness } from "@/lib/env";
import { getRouteGeoJson } from "@/lib/route-geojson";

export const metadata: Metadata = {
  title: "Live tracker",
  description:
    "Watch the Ottawa to Montreal ride progress with live positions, checkpoint status, and ride-day updates.",
};

export default async function TrackPage() {
  const readiness = getTrackerReadiness();
  const [content, ridePositions, rideUpdates, sponsors, routeFeature] = await Promise.all([
    getSiteContent(),
    getRidePositions(),
    getRideUpdates(),
    getSponsors(),
    getRouteGeoJson(),
  ]);

  return (
    <main className="bg-background px-6 pb-24 pt-32 md:px-10 md:pt-40">
      <div className="container-shell">
        <div className="mb-12 flex flex-col gap-6 border-b border-foreground pb-12">
          <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
            Live tracking
          </p>
          <h1 className="max-w-6xl font-display text-6xl leading-[0.9] md:text-8xl lg:text-[8vw]">
            FOLLOW THE RIDE.
          </h1>
          <p className="max-w-3xl text-base leading-7 text-muted-foreground">
            Branded route map, live trail line, manual ride updates, and an operator workflow if the rider signal drops.
          </p>
        </div>
        <TrackerShell
          donationUrl={content.donationUrl}
          initialPositions={ridePositions}
          initialUpdates={rideUpdates}
          mapboxToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
          rideDate={content.rideDate}
          route={content.route}
          routeFeature={routeFeature}
          sponsors={sponsors}
          trackerStatus={content.trackerStatus}
        />
        <div className="mt-12 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <TrackerReadiness
            items={readiness}
            title="This page reports tracker deployment status in real time."
            description="Before ride day, use this to verify the public client, map token, rider token, and production URL are in place. If any item stays missing, the tracker falls back to manual updates and the static route experience."
          />
          <section className="border border-foreground p-8 md:p-10">
            <p className="text-[0.7rem] uppercase tracking-[0.32em] text-muted-foreground">
              Ride-day workflow
            </p>
            <div className="mt-6 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>1. Deploy `supabase/functions/ingest-position` and confirm the public `/track` page shows the public Supabase client as ready.</p>
              <p>2. Generate the Overland setup link from the runbook and send it to the lead rider after `RIDER_TOKEN` is set.</p>
              <p>3. Keep `/admin/updates` open on ride day so the operator can post checkpoint messages if the signal drops.</p>
            </div>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link href="/admin" className="pill-ghost">
                Open admin
              </Link>
              <Link href="https://supabase.com/dashboard" target="_blank" rel="noreferrer" className="pill-ghost">
                Open Supabase
              </Link>
            </div>
          </section>
        </div>
      </div>
      <DonateFloat donationUrl={content.donationUrl} />
    </main>
  );
}
