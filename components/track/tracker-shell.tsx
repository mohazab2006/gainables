"use client";

import { useEffect, useEffectEvent, useMemo, useState, startTransition } from "react";
import Image from "next/image";
import Link from "next/link";
import { Radio } from "lucide-react";

import { LiveCountdown } from "@/components/track/live-countdown";
import { LiveMap } from "@/components/track/live-map";
import { LiveMediaCard } from "@/components/track/live-media-card";
import { StatusCard } from "@/components/track/status-card";
import type {
  LiveMediaContent,
  MediaContent,
  RidePosition,
  RideUpdate,
  RouteContent,
  TrackerStatus,
} from "@/lib/fallback-content";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { deriveTrackerState, mapRidePosition, mapRideUpdate, resolveTrackerSnapshot } from "@/lib/track";
import type { Database } from "@/types/db";

type TrackerShellProps = {
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
  liveMedia: LiveMediaContent | null;
  mediaLinks: MediaContent["links"];
};

type RideUpdateRow = Database["public"]["Tables"]["ride_updates"]["Row"];
type RidePositionRow = Database["public"]["Tables"]["ride_positions"]["Row"];

export function TrackerShell({
  initialPositions,
  initialUpdates,
  mapboxToken,
  rideDate,
  route,
  routeFeature,
  trackerStatus,
  liveMedia,
  mediaLinks,
}: TrackerShellProps) {
  const [updates, setUpdates] = useState(initialUpdates);
  const [positions, setPositions] = useState(initialPositions);
  const [nowMs, setNowMs] = useState<number | null>(() => Date.now());
  // Filter out the synthetic "update-initial" placeholder from
  // `fallbackRideUpdates` so the Ride signal card shows a proper empty
  // state instead of a row stamped `2026-01-01T00:00:00.000Z`. Any real
  // operator-posted update has a UUID id and passes through unchanged.
  const realUpdates = useMemo(() => updates.filter((u) => u.id !== "update-initial"), [updates]);
  const latestUpdate = realUpdates[0] ?? updates[0] ?? null;
  const latestPosition = positions.at(-1) ?? null;
  const experienceState = deriveTrackerState({ trackerStatus, latestPosition });
  // Tracker snapshot is derived purely from GPS telemetry. Manual ride
  // updates (`latestUpdate`) are feed posts — displayed below — but they no
  // longer drive progress, km, or checkpoint state on the tracker.
  const trackerSnapshot = resolveTrackerSnapshot({
    route,
    latestPosition,
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

  return (
    <>
      {isPreRide ? <LiveCountdown rideDate={rideDate} className="mb-6" /> : null}

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
        <div className="space-y-6">
          <StatusCard
            latestPosition={latestPosition}
            nowMs={nowMs}
            snapshot={trackerSnapshot}
            state={experienceState}
            trackerStatus={trackerStatus}
            update={latestUpdate}
          />
          {!isPreRide ? <LiveMediaCard liveMedia={liveMedia} links={mediaLinks} /> : null}
        </div>

        <div className="space-y-6">
          <article className="rounded-4xl border border-border bg-background p-8 shadow-[0_16px_60px_rgba(10,10,10,0.04)] md:p-10">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Checkpoint list</p>
                <h2 className="mt-4 text-3xl font-medium tracking-tight md:text-4xl">
                  {experienceState === "finished"
                    ? "The route is complete and the final ride line is preserved below."
                    : "Each checkpoint advances as ride updates and Overland positions arrive."}
                </h2>
              </div>
              <Link
                href="/donate"
                className="rounded-full border border-border bg-secondary/45 px-5 py-3 text-sm font-medium transition hover:border-foreground"
              >
                Donate now
              </Link>
            </div>

            {/* Pre-ride has no snapshot (GPS hasn't started) but we still
                want the "up next" card highlighted — default to the first
                checkpoint (Ottawa) in that case so the rider's starting
                point reads as the current focus. Once the snapshot exists,
                `nextCheckpoint` takes over naturally. */}
            <div className="mt-8 grid gap-4">
              {checkpoints.map((checkpoint, index) => {
                const isStart = index === 0;
                const isFinish = index === checkpoints.length - 1;
                const nextUpName =
                  trackerSnapshot?.nextCheckpoint?.name ?? checkpoints[0]?.name ?? null;
                const active =
                  (experienceState !== "finished" && nextUpName === checkpoint.name) ||
                  (experienceState === "finished" && isFinish);
                const passed = trackerSnapshot ? trackerSnapshot.kmCompleted >= checkpoint.km : false;

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
                      <p className={active ? "text-background/65" : "text-muted-foreground"}>
                        {checkpoint.stage}
                      </p>
                      <p className="mt-1 text-lg font-medium">{checkpoint.name}</p>
                      {checkpoint.note ? (
                        <p
                          className={[
                            "mt-2 text-sm leading-6",
                            active ? "text-background/72" : "text-muted-foreground",
                          ].join(" ")}
                        >
                          {checkpoint.note}
                        </p>
                      ) : null}
                    </div>
                    <div className="flex flex-col items-start justify-between gap-2 md:items-end">
                      <span className={active ? "text-background/70" : "text-muted-foreground"}>
                        {checkpoint.distanceLabel}
                      </span>
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

          {showLivePanels ? (
            <article className="rounded-4xl border border-border bg-background p-8 shadow-[0_16px_60px_rgba(10,10,10,0.04)] md:p-10">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.24em] text-muted-foreground">Ride feed</p>
                  <h2 className="mt-4 font-display text-3xl leading-[1.05] tracking-tight md:text-4xl">
                    {experienceState === "finished" ? (
                      <>
                        Ride complete. <span className="display-italic text-muted-foreground">Thanks for riding with us.</span>
                      </>
                    ) : (
                      <>
                        From the road, <span className="display-italic text-muted-foreground">as it happens.</span>
                      </>
                    )}
                  </h2>
                </div>
                <span className="rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  {positions.length} positions
                </span>
              </div>

              <div className="mt-8 space-y-4">
                {realUpdates.length === 0 ? (
                  <div className="rounded-3xl border border-dashed border-border bg-secondary/20 px-6 py-10 text-center md:px-10 md:py-12">
                    <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-border bg-background text-muted-foreground">
                      <Radio size={20} aria-hidden />
                    </div>
                    <p className="mt-5 font-display text-2xl leading-tight tracking-tight md:text-3xl">
                      Quiet on the wire.
                    </p>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground md:text-base md:leading-7">
                      {experienceState === "finished"
                        ? "The ride is complete and no post-ride notes have been posted here yet."
                        : "No updates from the road yet. Checkpoint notes and photos will land here the moment the team posts them."}
                    </p>
                    <div className="mt-6 flex flex-wrap items-center justify-center gap-3 text-xs uppercase tracking-[0.22em] text-muted-foreground">
                      <span className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-3 py-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
                        Listening for updates
                      </span>
                      <span className="hidden h-px w-8 bg-border md:inline-block" />
                      <span>{positions.length} positions logged</span>
                    </div>
                  </div>
                ) : null}
                {realUpdates.slice(0, 4).map((update, index) => (
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
                      {/* km_completed is auto-captured from the latest GPS ping
                          when the admin posts the update — each card carries
                          its own snapshot. Falsy (0) means no GPS was
                          available at post time, so hide the pip entirely. */}
                      {update.kmCompleted > 0 ? (
                        <>
                          <span className="h-1 w-1 rounded-full bg-border" />
                          <span>{update.kmCompleted.toFixed(1)} km</span>
                        </>
                      ) : null}
                    </div>
                    <p className="mt-4 text-xl font-medium tracking-tight">{update.message}</p>
                    {update.mediaUrl ? (
                      <div className="mt-5 overflow-hidden rounded-3xl border border-border/60 bg-background/60">
                        {update.mediaKind === "video" ? (
                          <video className="h-auto w-full object-cover" controls playsInline preload="metadata">
                            <source src={update.mediaUrl} />
                          </video>
                        ) : (
                          <div className="relative aspect-16/10 w-full">
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
    </>
  );
}
