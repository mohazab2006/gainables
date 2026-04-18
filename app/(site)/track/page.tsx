import Link from "next/link";

import { TrackerReadiness } from "@/components/operations/tracker-readiness";
import { DonateFloat } from "@/components/track/donate-float";
import { TrackerShell } from "@/components/track/tracker-shell";
import { getRidePositions, getRideUpdates, getSiteContent, getSponsors } from "@/lib/content";
import { getTrackerReadiness } from "@/lib/env";
import { getRouteGeoJson } from "@/lib/route-geojson";

export const revalidate = 15;

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
    <main className="bg-background px-4 pb-20 pt-32 md:px-8 lg:px-10">
      <div className="mx-auto max-w-[96rem]">
        <div className="mb-10 flex flex-col gap-4">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Live tracking</p>
          <h1 className="max-w-4xl text-5xl font-medium tracking-tight md:text-7xl">
            Follow the Ottawa to Montreal ride in real time.
          </h1>
          <p className="max-w-3xl text-lg leading-8 text-muted-foreground">
            The tracker is now designed around the live Overland feed: branded route map, live trail line, manual ride updates,
            and a fallback operator workflow if the rider signal drops.
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
        <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <TrackerReadiness
            items={readiness}
            title="This page reports tracker deployment status in real time."
            description="Before ride day, use this to verify the public client, map token, rider token, and production URL are in place. If any item stays missing, the tracker falls back to manual updates and the static route experience."
          />
          <section className="rounded-[2rem] border border-border bg-background p-8 shadow-[0_16px_60px_rgba(10,10,10,0.04)] md:p-10">
            <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Ride-day workflow</p>
            <div className="mt-5 space-y-4 text-sm leading-7 text-muted-foreground">
              <p>1. Deploy `supabase/functions/ingest-position` and confirm the public `/track` page shows the public Supabase client as ready.</p>
              <p>2. Generate the Overland setup link from the runbook and send it to the lead rider after `RIDER_TOKEN` is set.</p>
              <p>3. Keep `/admin/updates` open on ride day so the operator can post checkpoint messages if the signal drops.</p>
            </div>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link
                href="/admin"
                className="inline-flex rounded-full border border-border bg-secondary/45 px-5 py-3 text-sm font-medium transition hover:border-foreground"
              >
                Open admin
              </Link>
              <Link
                href="https://supabase.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="inline-flex rounded-full border border-border px-5 py-3 text-sm font-medium transition hover:border-foreground"
              >
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
