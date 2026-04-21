import type { RidePosition, RideUpdate, TrackerStatus } from "@/lib/fallback-content";
import type { TrackerSnapshot } from "@/lib/track";
import { deriveSignalStatus, formatCountdown, formatRideUpdateDate } from "@/lib/track";

export function StatusCard({
  latestPosition,
  nowMs,
  rideDate,
  snapshot,
  state,
  trackerStatus,
  update,
}: {
  latestPosition: RidePosition | null;
  nowMs: number | null;
  rideDate: string;
  snapshot: TrackerSnapshot | null;
  state: "pre_ride" | "live" | "finished";
  trackerStatus: TrackerStatus;
  update: RideUpdate | null;
}) {
  const batteryLabel = latestPosition?.batteryPct !== null && latestPosition?.batteryPct !== undefined ? `${Math.round(latestPosition.batteryPct)}% battery` : "Battery unavailable";
  const speedLabel = latestPosition?.speedMps ? `${(latestPosition.speedMps * 3.6).toFixed(1)} km/h` : "Speed unavailable";
  const isPreRide = state === "pre_ride";
  const checkpointLabel = snapshot?.nextCheckpoint?.name ?? update?.nextCheckpoint ?? "Ottawa start";
  const totalDistanceLabel = snapshot ? `${Math.round(snapshot.totalDistanceKm)} km` : "200 km";

  return (
    <aside className="rounded-[2rem] border border-white/8 bg-surface p-7 text-foreground md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-foreground/50">Tracker state</p>
          <p className="mt-3 text-3xl font-medium tracking-tight">
            {state === "pre_ride" ? "Countdown" : state === "finished" ? "Ride summary" : snapshot?.locationLabel ?? update?.location ?? "Live ride"}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-foreground/50">Mode</p>
          <p className="mt-1 text-sm font-medium">{trackerStatus.replace("_", " ")}</p>
        </div>
      </div>

      {state === "pre_ride" ? (
        <div className="mt-6 rounded-[1.6rem] border border-white/10 bg-white/[0.04] p-5">
          <p className="text-sm uppercase tracking-[0.2em] text-foreground/50">Activation</p>
          <p className="mt-2 text-4xl font-medium tracking-tight">{formatCountdown(rideDate, nowMs)}</p>
          <p className="mt-3 max-w-xl text-sm leading-6 text-foreground/68">
            The route is visible now. Live tracking starts automatically when the first ride-day position lands.
          </p>
        </div>
      ) : null}

      {snapshot && !isPreRide ? (
        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-foreground/50">Distance covered</p>
              <p className="mt-2 text-4xl font-medium tracking-tight">{Math.round(snapshot.progressPercent)}%</p>
            </div>
            <p className="text-sm text-foreground/65">
              {snapshot.kmCompleted.toFixed(1)} / {snapshot.totalDistanceKm} km
            </p>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-accent transition-[width]" style={{ width: `${snapshot.progressPercent}%` }} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Next checkpoint" value={snapshot.nextCheckpoint?.name ?? update?.nextCheckpoint ?? "Awaiting checkpoint"} />
            <Metric label="Remaining distance" value={`${Math.round(snapshot.remainingKm)} km`} />
          </div>
        </div>
      ) : null}

      {isPreRide ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <Badge label="Route distance" value={totalDistanceLabel} />
          <Badge label="First checkpoint" value={checkpointLabel} />
        </div>
      ) : (
        <>
          <div className="mt-8 grid gap-3 sm:grid-cols-2">
            <Badge label="Signal" value={deriveSignalStatus(latestPosition, nowMs)} />
            <Badge label="Telemetry" value={batteryLabel} />
            <Badge label="Speed" value={speedLabel} />
            <Badge
              label="Last update"
              value={latestPosition ? formatRideUpdateDate(latestPosition.recordedAt) : update ? formatRideUpdateDate(update.createdAt) : "Awaiting feed"}
            />
          </div>

          <div className="mt-8 space-y-6">
            <Item label="Latest message" value={update?.message ?? "Ride updates will appear here once the operator posts the first checkpoint note."} />
            <Item label="Current checkpoint" value={snapshot?.currentCheckpoint?.name ?? "Ottawa start"} />
            <Item label="Progress source" value={snapshot?.source === "live" ? "Live GPS route sync" : "Manual admin update"} />
          </div>
        </>
      )}
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <p className="text-sm uppercase tracking-[0.18em] text-foreground/50">{label}</p>
      <p className="mt-2 text-lg font-medium">{value}</p>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/[0.04] p-4">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-foreground/50">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
      <p className="text-sm uppercase tracking-[0.2em] text-foreground/50">{label}</p>
      <p className="mt-3 text-lg font-medium leading-7">{value}</p>
    </div>
  );
}
