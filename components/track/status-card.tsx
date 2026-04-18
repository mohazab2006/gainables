import type { RidePosition, RideUpdate, RouteContent, TrackerStatus } from "@/lib/fallback-content";
import { deriveSignalStatus, formatCountdown, formatRideUpdateDate, getTrackerSnapshot } from "@/lib/track";

export function StatusCard({
  latestPosition,
  nowMs,
  rideDate,
  route,
  state,
  trackerStatus,
  update,
}: {
  latestPosition: RidePosition | null;
  nowMs: number | null;
  rideDate: string;
  route: RouteContent;
  state: "pre_ride" | "live" | "finished";
  trackerStatus: TrackerStatus;
  update: RideUpdate | null;
}) {
  const snapshot = update ? getTrackerSnapshot(route, update) : null;
  const batteryLabel = latestPosition?.batteryPct !== null && latestPosition?.batteryPct !== undefined ? `${Math.round(latestPosition.batteryPct)}% battery` : "Battery unavailable";
  const speedLabel = latestPosition?.speedMps ? `${(latestPosition.speedMps * 3.6).toFixed(1)} km/h` : "Speed unavailable";

  return (
    <aside className="rounded-[2rem] border border-border bg-foreground p-8 text-background md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-background/60">Tracker state</p>
          <p className="mt-3 text-3xl font-medium tracking-tight">
            {state === "pre_ride" ? "Countdown" : state === "finished" ? "Ride summary" : update?.location ?? "Live ride"}
          </p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-background/55">Mode</p>
          <p className="mt-1 text-sm font-medium">{trackerStatus.replace("_", " ")}</p>
        </div>
      </div>

      {state === "pre_ride" ? (
        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.2em] text-background/55">Activation</p>
          <p className="mt-3 text-4xl font-medium tracking-tight">{formatCountdown(rideDate, nowMs)}</p>
          <p className="mt-4 max-w-xl text-sm leading-7 text-background/72">
            The map is showing the planned route now. Once the rider starts Overland and the first position lands in Supabase, the page switches into live telemetry automatically.
          </p>
        </div>
      ) : null}

      {update && snapshot ? (
        <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-background/55">Distance covered</p>
              <p className="mt-2 text-4xl font-medium tracking-tight">{Math.round(snapshot.progressPercent)}%</p>
            </div>
            <p className="text-sm text-background/65">
              {update.kmCompleted} / {snapshot.totalDistanceKm} km
            </p>
          </div>
          <div className="mt-4 h-2 rounded-full bg-white/10">
            <div className="h-full rounded-full bg-background transition-[width]" style={{ width: `${snapshot.progressPercent}%` }} />
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Metric label="Next checkpoint" value={snapshot.nextCheckpoint?.name ?? update.nextCheckpoint} />
            <Metric label="Remaining distance" value={`${Math.round(snapshot.remainingKm)} km`} />
          </div>
        </div>
      ) : null}

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
      </div>
    </aside>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <p className="text-sm uppercase tracking-[0.18em] text-background/55">{label}</p>
      <p className="mt-2 text-lg font-medium">{value}</p>
    </div>
  );
}

function Badge({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[1.25rem] border border-white/10 bg-white/5 p-4">
      <p className="text-[0.72rem] uppercase tracking-[0.2em] text-background/55">{label}</p>
      <p className="mt-2 text-sm font-medium">{value}</p>
    </div>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div className="border-b border-white/10 pb-6 last:border-b-0 last:pb-0">
      <p className="text-sm uppercase tracking-[0.2em] text-background/55">{label}</p>
      <p className="mt-3 text-lg font-medium leading-7">{value}</p>
    </div>
  );
}
