"use client";

import { useEffect, useEffectEvent, useState, startTransition } from "react";

import { LiveMap } from "@/components/track/live-map";
import { SponsorStrip } from "@/components/track/sponsor-strip";
import { StatusCard } from "@/components/track/status-card";
import type { RideUpdate, RouteContent, Sponsor } from "@/lib/fallback-content";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatRideUpdateDate, getTrackerSnapshot, mapRideUpdate } from "@/lib/track";
import type { Database } from "@/types/db";

type TrackerShellProps = {
  donationUrl: string;
  initialUpdates: RideUpdate[];
  mapboxToken?: string;
  route: RouteContent;
  sponsors: Sponsor[];
  trackerEmbedUrl?: string | null;
};

type RideUpdateRow = Database["public"]["Tables"]["ride_updates"]["Row"];

export function TrackerShell({
  donationUrl,
  initialUpdates,
  mapboxToken,
  route,
  sponsors,
  trackerEmbedUrl,
}: TrackerShellProps) {
  const [updates, setUpdates] = useState(initialUpdates);
  const latestUpdate = updates[0];
  const fallbackCoordinates = initialUpdates[0] ?? { lat: route.mapCenter.lat, lng: route.mapCenter.lng };
  const snapshot = latestUpdate ? getTrackerSnapshot(route, latestUpdate) : null;

  const refreshUpdates = useEffectEvent(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("ride_updates")
      .select("id, created_at, location, km_completed, next_checkpoint, message, lat, lng")
      .order("created_at", { ascending: false })
      .limit(6);

    if (error || !data?.length) {
      return;
    }

    const nextUpdates = data.map((row) => mapRideUpdate(row as RideUpdateRow, fallbackCoordinates));
    startTransition(() => setUpdates(nextUpdates));
  });

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("ride-updates-live")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "ride_updates" },
        () => {
          void refreshUpdates();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [refreshUpdates]);

  if (!latestUpdate || !snapshot) {
    return null;
  }

  return (
    <>
      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <LiveMap
          mapboxToken={mapboxToken}
          trackerEmbedUrl={trackerEmbedUrl}
          route={route}
          update={latestUpdate}
        />
        <StatusCard route={route} update={latestUpdate} />
      </div>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.95fr_1.05fr]">
        <article className="rounded-[2rem] border border-border bg-secondary/55 p-8 md:p-10">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Route progress</p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
                Checkpoints stay visible even if the live map feed is unavailable.
              </h2>
            </div>
            <a
              href={donationUrl}
              target="_blank"
              rel="noreferrer"
              className="hidden rounded-full border border-border bg-background px-5 py-3 text-sm font-medium transition hover:border-foreground md:inline-flex"
            >
              Support the ride
            </a>
          </div>
          <div className="mt-8 space-y-4">
            {snapshot.checkpoints.map((checkpoint, index) => {
              const isComplete = latestUpdate.kmCompleted >= checkpoint.km;
              const isActive = snapshot.nextCheckpoint?.name === checkpoint.name;

              return (
                <div
                  key={checkpoint.name}
                  className={[
                    "grid gap-3 rounded-[1.75rem] border px-5 py-5 transition md:grid-cols-[auto_1fr_auto]",
                    isActive
                      ? "border-foreground bg-foreground text-background"
                      : isComplete
                        ? "border-border bg-background"
                        : "border-border/80 bg-background/60",
                  ].join(" ")}
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium">
                    {String(index + 1).padStart(2, "0")}
                  </div>
                  <div>
                    <p className={isActive ? "text-background/65" : "text-muted-foreground"}>{checkpoint.stage}</p>
                    <p className="mt-1 text-lg font-medium">{checkpoint.name}</p>
                  </div>
                  <div className="flex flex-col items-start justify-between gap-2 md:items-end">
                    <span className={isActive ? "text-background/70" : "text-muted-foreground"}>{checkpoint.distance}</span>
                    <span
                      className={[
                        "rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]",
                        isActive
                          ? "bg-background text-foreground"
                          : isComplete
                            ? "bg-secondary text-foreground"
                            : "border border-border text-muted-foreground",
                      ].join(" ")}
                    >
                      {isActive ? "Next" : isComplete ? "Passed" : "Ahead"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </article>

        <article className="rounded-[2rem] border border-border bg-background p-8 shadow-[0_16px_60px_rgba(10,10,10,0.04)] md:p-10">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Live update stream</p>
              <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">Latest rider notes and checkpoint calls.</h2>
            </div>
            <span className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
              {updates.length} updates
            </span>
          </div>
          <div className="mt-8 space-y-4">
            {updates.map((update, index) => (
              <article
                key={update.id}
                className={[
                  "rounded-[1.75rem] border px-5 py-5",
                  index === 0 ? "border-foreground bg-secondary/45" : "border-border bg-secondary/20",
                ].join(" ")}
              >
                <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                  <span>{formatRideUpdateDate(update.createdAt)}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{update.location}</span>
                  <span className="h-1 w-1 rounded-full bg-border" />
                  <span>{update.kmCompleted} km complete</span>
                </div>
                <p className="mt-4 text-xl font-medium tracking-tight">{update.message}</p>
                <p className="mt-3 text-sm leading-7 text-muted-foreground">Next checkpoint: {update.nextCheckpoint}</p>
              </article>
            ))}
          </div>
        </article>
      </section>

      <SponsorStrip sponsors={sponsors} />
    </>
  );
}
