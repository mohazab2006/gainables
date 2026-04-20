"use client";

import { useEffect, useEffectEvent, useState, startTransition } from "react";

import { LiveMap } from "@/components/track/live-map";
import { SponsorStrip } from "@/components/track/sponsor-strip";
import { StatusCard } from "@/components/track/status-card";
import type { RidePosition, RideUpdate, RouteContent, Sponsor, TrackerStatus } from "@/lib/fallback-content";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deriveTrackerState, formatCountdown, getTrackerSnapshot, mapRidePosition, mapRideUpdate } from "@/lib/track";
import type { Database } from "@/types/db";

type TrackerShellProps = {
  donationUrl: string;
  initialPositions: RidePosition[];
  initialUpdates: RideUpdate[];
  mapboxToken?: string;
  rideDate: string;
  route: RouteContent;
  routeFeature: {
    type: "Feature";
    properties?: Record<string, unknown>;
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  };
  sponsors: Sponsor[];
  trackerStatus: TrackerStatus;
};

type RideUpdateRow = Database["public"]["Tables"]["ride_updates"]["Row"];
type RidePositionRow = Database["public"]["Tables"]["ride_positions"]["Row"];

export function TrackerShell({
  donationUrl,
  initialPositions,
  initialUpdates,
  mapboxToken,
  rideDate,
  route,
  routeFeature,
  sponsors,
  trackerStatus,
}: TrackerShellProps) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [positions, setPositions] = useState(initialPositions);
  const [nowMs, setNowMs] = useState<number | null>(() => Date.now());
  const latestUpdate = updates[0] ?? null;
  const latestPosition = positions.at(-1) ?? null;
  const experienceState = deriveTrackerState({ trackerStatus, latestPosition });

  useEffect(() => {
    const interval = window.setInterval(() => setNowMs(Date.now()), 60_000);
    return () => window.clearInterval(interval);
  }, []);

  const fallbackCoordinates = latestUpdate
    ? { lat: latestUpdate.lat, lng: latestUpdate.lng }
    : { lat: route.mapCenter.lat, lng: route.mapCenter.lng };

  const refreshUpdates = useEffectEvent(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("ride_updates")
      .select("id, created_at, location, km_completed, next_checkpoint, message, lat, lng")
      .order("created_at", { ascending: false })
      .limit(8);

    if (error || !data?.length) {
      return;
    }

    startTransition(() => {
      setUpdates(data.map((row) => mapRideUpdate(row as RideUpdateRow, fallbackCoordinates)));
    });
  });

  const refreshPositions = useEffectEvent(async () => {
    const supabase = createSupabaseBrowserClient();
    const { data, error } = await supabase
      .from("ride_positions")
      .select("id, recorded_at, lon, lat, accuracy_m, speed_mps, battery_pct, source, raw")
      .order("recorded_at", { ascending: false })
      .limit(120);

    if (error || !data?.length) {
      return;
    }

    startTransition(() => {
      setPositions(
        data
          .map((row) => mapRidePosition(row as RidePositionRow))
          .sort((a, b) => a.recordedAt.localeCompare(b.recordedAt)),
      );
    });
  });

  useEffect(() => {
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!url || !key) {
      return;
    }

    const supabase = createSupabaseBrowserClient();
    const channel = supabase
      .channel("ride-tracker-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "ride_updates" }, () => void refreshUpdates())
      .on("postgres_changes", { event: "*", schema: "public", table: "ride_positions" }, () => void refreshPositions())
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, []);

  const checkpoints = route.checkpoints;
  const trackerSnapshot = latestUpdate
    ? getTrackerSnapshot(route, latestUpdate)
    : null;
  const progressPercent =
    experienceState === "finished"
      ? 100
      : trackerSnapshot?.progressPercent ?? 0;

  return (
    <>
      <section className="rounded-[2.25rem] border border-border bg-secondary/35 p-4 md:p-5">
        <LiveMap
          checkpoints={checkpoints}
          mapboxToken={mapboxToken}
          positions={positions}
          progressPercent={progressPercent}
          routeFeature={routeFeature}
          route={route}
          state={experienceState}
        />
      </section>

      <section className="mt-6 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <StatusCard
          latestPosition={latestPosition}
          nowMs={nowMs}
          rideDate={rideDate}
          route={route}
          state={experienceState}
          trackerStatus={trackerStatus}
          update={latestUpdate}
        />

        <div className="space-y-6">
          <article className="rounded-4xl border border-border bg-background p-8 shadow-[0_16px_60px_rgba(10,10,10,0.04)] md:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Checkpoint list</p>
                <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
                  {experienceState === "pre_ride"
                    ? "The full Ottawa to Montreal route is locked in before ride day."
                    : experienceState === "finished"
                      ? "The route is complete and the final ride line is preserved below."
                      : "Each checkpoint advances as ride updates and Overland positions arrive."}
                </h2>
              </div>
              <a
                href={donationUrl}
                target="_blank"
                rel="noreferrer"
                className="rounded-full border border-border bg-secondary/45 px-5 py-3 text-sm font-medium transition hover:border-foreground"
              >
                Donate now
              </a>
            </div>

            <div className="mt-8 grid gap-4">
              {checkpoints.map((checkpoint, index) => {
                const isStart = index === 0;
                const isFinish = index === checkpoints.length - 1;
                const active =
                  latestUpdate?.nextCheckpoint === checkpoint.name ||
                  (experienceState === "pre_ride" && isStart) ||
                  (experienceState === "finished" && isFinish);
                const passed = latestUpdate ? latestUpdate.kmCompleted >= checkpoint.km : false;

                return (
                  <div
                    key={checkpoint.name}
                    className={[
                      "grid gap-3 rounded-[1.75rem] border px-5 py-5 md:grid-cols-[auto_1fr_auto]",
                      active
                        ? "border-foreground bg-foreground text-background"
                        : passed
                          ? "border-border bg-secondary/35"
                          : "border-border bg-background",
                    ].join(" ")}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium">
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p className={active ? "text-background/65" : "text-muted-foreground"}>{checkpoint.stage}</p>
                      <p className="mt-1 text-lg font-medium">{checkpoint.name}</p>
                      {checkpoint.note ? (
                        <p className={["mt-2 text-sm leading-6", active ? "text-background/72" : "text-muted-foreground"].join(" ")}>
                          {checkpoint.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start justify-between gap-2 md:items-end">
                      <span className={active ? "text-background/70" : "text-muted-foreground"}>{checkpoint.distanceLabel}</span>
                      <span className="rounded-full border border-current/15 px-3 py-1 text-xs uppercase tracking-[0.18em]">
                        {isStart
                          ? "Start"
                          : isFinish
                            ? "Finish"
                            : active
                              ? "Next"
                              : passed
                                ? "Passed"
                                : "Ahead"}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </article>

          <article className="rounded-4xl border border-border bg-background p-8 shadow-[0_16px_60px_rgba(10,10,10,0.04)] md:p-10">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Ride signal</p>
                <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
                  {experienceState === "pre_ride"
                    ? formatCountdown(rideDate, nowMs)
                    : experienceState === "finished"
                      ? "Ride complete. Thanks for backing the campaign."
                      : "Latest manual updates and ride telemetry."}
                </h2>
              </div>
              <span className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                {positions.length} positions
              </span>
            </div>

            <div className="mt-8 space-y-4">
              {updates.slice(0, 4).map((update, index) => (
                <article
                  key={update.id}
                  className={[
                    "rounded-[1.75rem] border px-5 py-5",
                    index === 0 ? "border-foreground bg-secondary/45" : "border-border bg-secondary/20",
                  ].join(" ")}
                >
                  <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                    <span>{new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" }).format(new Date(update.createdAt))}</span>
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
        </div>
      </section>

      <SponsorStrip sponsors={sponsors} />
    </>
  );
}
