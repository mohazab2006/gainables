"use client";

import { useEffect, useEffectEvent, useMemo, useState, startTransition } from "react";
import Image from "next/image";

import { EndpointLabel, RouteCurve } from "@/components/sections/biker-timeline";
import { LiveMap } from "@/components/track/live-map";
import { StatusCard } from "@/components/track/status-card";
import type { RidePosition, RideUpdate, RouteContent, TrackerStatus } from "@/lib/fallback-content";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deriveTrackerState, formatCountdown, mapRidePosition, mapRideUpdate, resolveTrackerSnapshot } from "@/lib/track";
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
  trackerStatus,
}: TrackerShellProps) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [positions, setPositions] = useState(initialPositions);
  const [nowMs, setNowMs] = useState<number | null>(() => Date.now());
  const latestUpdate = updates[0] ?? null;
  const latestPosition = positions.at(-1) ?? null;
  const experienceState = deriveTrackerState({ trackerStatus, latestPosition });
  const trackerSnapshot = resolveTrackerSnapshot({
    route,
    latestPosition,
    latestUpdate,
    nowMs: nowMs ?? undefined,
  });

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
      .select("id, created_at, location, km_completed, next_checkpoint, message, lat, lng, media_url, media_kind, media_alt")
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
  const progressPercent =
    experienceState === "finished"
      ? 100
      : trackerSnapshot?.progressPercent ?? 0;
  const showLivePanels = experienceState !== "pre_ride";
  const isPreRide = experienceState === "pre_ride";
  const startCp = route.checkpoints[0];
  const endCp = route.checkpoints.at(-1);
  const midWithPercent = useMemo(
    () =>
      route.checkpoints.slice(1, -1).map((checkpoint) => ({
        name: checkpoint.name,
        km: checkpoint.km,
        pct: Math.max(0, Math.min(100, (checkpoint.km / Math.max(route.totalDistanceKm, 1)) * 100)),
      })),
    [route.checkpoints, route.totalDistanceKm],
  );
  const rideDayLabel = useMemo(() => {
    const date = new Date(rideDate);
    if (Number.isNaN(date.getTime())) return "TBA";
    return new Intl.DateTimeFormat("en-CA", { month: "short", day: "numeric" }).format(date);
  }, [rideDate]);
  const preRidePreviewProgress = 42;

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

      {isPreRide ? (
        <section className="mt-16">
          <div className="grid gap-10 md:grid-cols-[auto_1fr] md:items-end md:justify-between">
            <div>
              <p className="eyebrow">Ride preview</p>
              <h2 className="mt-5 display-hero text-6xl md:text-8xl lg:text-[9rem]">
                Ottawa <span className="display-italic text-muted-foreground">to</span> Montreal
              </h2>
            </div>
            <div className="flex flex-col gap-1 text-right font-sans text-sm text-muted-foreground md:max-w-xs">
              <span className="eyebrow text-foreground/60">Ride day</span>
              <span className="text-lg text-foreground">{rideDayLabel}</span>
              <span>{formatCountdown(rideDate, nowMs)}</span>
            </div>
          </div>

          <div className="relative mt-20 md:mt-24">
            <RouteCurve progressPercent={preRidePreviewProgress} midCheckpoints={midWithPercent} />
            <EndpointLabel name={startCp?.name ?? "Ottawa"} km={startCp?.km ?? 0} align="left" />
            <EndpointLabel
              name={endCp?.name ?? "Montreal"}
              km={endCp?.km ?? route.totalDistanceKm}
              align="right"
            />
          </div>

          <div className="mt-20 grid gap-10 border-t border-white/10 pt-10 md:grid-cols-3">
            <div>
              <p className="eyebrow">Ride day</p>
              <p className="mt-4 font-display text-7xl leading-none tracking-tight md:text-8xl">
                {rideDayLabel}
              </p>
            </div>
            <div>
              <p className="eyebrow">Route</p>
              <p className="mt-4 font-display text-7xl leading-none tracking-tight md:text-8xl">
                {route.totalDistanceKm}
                <span className="text-muted-foreground text-4xl md:text-5xl">
                  {" "}km · {route.checkpoints.length} checkpoints
                </span>
              </p>
            </div>
            <div>
              <p className="eyebrow">Status</p>
              <p className="mt-4 font-display text-3xl tracking-tight md:text-4xl">Pre-ride</p>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">
                {formatCountdown(rideDate, nowMs)} · Live tracking activates on ride day.
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {!isPreRide ? (
      <section className="mt-6 grid gap-6 xl:grid-cols-[0.72fr_1.28fr]">
        <StatusCard
          latestPosition={latestPosition}
          nowMs={nowMs}
          rideDate={rideDate}
          snapshot={trackerSnapshot}
          state={experienceState}
          trackerStatus={trackerStatus}
          update={latestUpdate}
        />

        <div className="space-y-6">
          <article
            className={[
              "p-8 md:p-10",
              isPreRide
                ? "rounded-[2.2rem] border border-white/8 bg-white/[0.03]"
                : "rounded-4xl border border-border bg-background shadow-[0_16px_60px_rgba(10,10,10,0.04)]",
            ].join(" ")}
          >
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Checkpoint list</p>
                <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
                  {experienceState === "finished"
                    ? "The route is complete and the final ride line is preserved below."
                    : "Each checkpoint advances as ride updates and Overland positions arrive."}
                </h2>
              </div>
              <a
                href={donationUrl}
                target="_blank"
                rel="noreferrer"
                className={[
                  "rounded-full px-5 py-3 text-sm font-medium transition",
                  isPreRide
                    ? "border border-white/12 bg-white/5 text-foreground hover:border-white/30 hover:bg-white/10"
                    : "border border-border bg-secondary/45 hover:border-foreground",
                ].join(" ")}
              >
                Donate now
              </a>
            </div>

            <div className="mt-8 grid gap-4">
              {checkpoints.map((checkpoint, index) => {
                const isStart = index === 0;
                const isFinish = index === checkpoints.length - 1;
                const active =
                  trackerSnapshot?.nextCheckpoint?.name === checkpoint.name ||
                  (experienceState === "finished" && isFinish);
                const passed = trackerSnapshot ? trackerSnapshot.kmCompleted >= checkpoint.km : false;

                return (
                  <div
                    key={checkpoint.name}
                    className={[
                      "grid gap-3 rounded-[1.75rem] border px-5 py-5 md:grid-cols-[auto_1fr_auto]",
                      isPreRide
                        ? active
                          ? "border-accent/35 bg-accent/10 text-foreground"
                          : "border-white/10 bg-white/[0.04] text-foreground"
                        : active
                          ? "border-foreground bg-foreground text-background"
                          : passed
                            ? "border-border bg-secondary/35"
                            : "border-border bg-background",
                    ].join(" ")}
                  >
                    <div
                      className={[
                        "flex h-10 w-10 items-center justify-center rounded-full border text-sm font-medium",
                        isPreRide
                          ? active
                            ? "border-accent/40 bg-accent/15"
                            : "border-white/12 bg-white/[0.03]"
                          : "",
                      ].join(" ")}
                    >
                      {String(index + 1).padStart(2, "0")}
                    </div>
                    <div>
                      <p
                        className={
                          isPreRide
                            ? active
                              ? "text-foreground/65"
                              : "text-muted-foreground"
                            : active
                              ? "text-background/65"
                              : "text-muted-foreground"
                        }
                      >
                        {checkpoint.stage}
                      </p>
                      <p className="mt-1 text-lg font-medium">{checkpoint.name}</p>
                      {checkpoint.note ? (
                        <p
                          className={[
                            "mt-2 text-sm leading-6",
                            isPreRide
                              ? active
                                ? "text-foreground/72"
                                : "text-muted-foreground"
                              : active
                                ? "text-background/72"
                                : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {checkpoint.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start justify-between gap-2 md:items-end">
                      <span
                        className={
                          isPreRide
                            ? active
                              ? "text-foreground/70"
                              : "text-muted-foreground"
                            : active
                              ? "text-background/70"
                              : "text-muted-foreground"
                        }
                      >
                        {checkpoint.distanceLabel}
                      </span>
                      <span
                        className={[
                          "rounded-full px-3 py-1 text-xs uppercase tracking-[0.18em]",
                          isPreRide
                            ? active
                              ? "border border-accent/30 bg-accent/12 text-foreground"
                              : "border border-white/12 bg-white/[0.03] text-foreground/70"
                            : "border border-current/15",
                        ].join(" ")}
                      >
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

          {showLivePanels ? (
            <article className="rounded-4xl border border-border bg-background p-8 shadow-[0_16px_60px_rgba(10,10,10,0.04)] md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Ride signal</p>
                  <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
                    {experienceState === "finished"
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
                      <span>{(trackerSnapshot?.source === "live" && index === 0 ? trackerSnapshot.kmCompleted : update.kmCompleted).toFixed(1)} km complete</span>
                    </div>
                    <p className="mt-4 text-xl font-medium tracking-tight">{update.message}</p>
                    <p className="mt-3 text-sm leading-7 text-muted-foreground">Next checkpoint: {update.nextCheckpoint}</p>
                    {update.mediaUrl ? (
                      <div className="mt-5 overflow-hidden rounded-[1.5rem] border border-border/60 bg-background/60">
                        {update.mediaKind === "video" ? (
                          <video className="h-auto w-full object-cover" controls playsInline preload="metadata">
                            <source src={update.mediaUrl} />
                          </video>
                        ) : (
                          <div className="relative aspect-[16/10] w-full">
                            <Image
                              src={update.mediaUrl}
                              alt={update.mediaAlt ?? update.message}
                              fill
                              sizes="(min-width: 1280px) 780px, 100vw"
                              className="object-cover"
                            />
                          </div>
                        )}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </article>
          ) : null}
        </div>
      </section>
      ) : null}
    </>
  );
}
