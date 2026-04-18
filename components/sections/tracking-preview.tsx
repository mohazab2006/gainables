import Link from "next/link";

import type { RideUpdate } from "@/lib/fallback-content";

export function TrackingPreviewSection({
  update,
  trackerEmbedUrl,
  donationUrl,
}: {
  update: RideUpdate;
  trackerEmbedUrl?: string | null;
  donationUrl: string;
}) {
  return (
    <section className="bg-background px-6 py-24 md:px-12 lg:px-20">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-[1fr_0.9fr]">
        <div className="rounded-[2rem] border border-border bg-secondary/50 p-8 md:p-10">
          <p className="text-sm uppercase tracking-[0.28em] text-muted-foreground">Tracking preview</p>
          <h2 className="mt-5 text-4xl font-medium tracking-tight md:text-5xl">
            Ride-day status stays readable even before a supporter opens the full tracker.
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <Stat label="Current location" value={update.location} />
            <Stat label="Distance complete" value={`${update.kmCompleted} km`} />
            <Stat label="Next checkpoint" value={update.nextCheckpoint} />
            <Stat label="Latest note" value={update.message} />
          </div>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/track" className="rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background transition hover:opacity-85">
              Open live tracker
            </Link>
            <Link
              href={donationUrl}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-border px-6 py-3 text-sm font-medium transition hover:bg-secondary"
            >
              Support the ride
            </Link>
          </div>
        </div>
        <div className="overflow-hidden rounded-[2rem] border border-border bg-foreground p-4">
          {trackerEmbedUrl ? (
            <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-background">
              <iframe title="Tracker preview" src={trackerEmbedUrl} className="h-full w-full border-0" loading="lazy" />
            </div>
          ) : (
            <div className="flex aspect-[4/3] flex-col justify-between rounded-[1.5rem] bg-neutral-950 p-8 text-white">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-white/60">GPS feed placeholder</p>
                <h3 className="mt-4 text-3xl font-medium tracking-tight">Mapbox and realtime updates are wired to drop in here.</h3>
              </div>
              <p className="max-w-md text-sm leading-7 text-white/70">
                Set `tracker_embed_url` for an immediate iframe fallback, or supply `NEXT_PUBLIC_MAPBOX_TOKEN` for the live
                route view.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.75rem] border border-border bg-background p-5">
      <p className="text-sm uppercase tracking-[0.2em] text-muted-foreground">{label}</p>
      <p className="mt-3 text-lg font-medium leading-7">{value}</p>
    </div>
  );
}
