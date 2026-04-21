import type { RidePosition, RideUpdate, TrackerStatus } from "@/lib/fallback-content";
import type { TrackerSnapshot } from "@/lib/track";
import { deriveSignalStatus, formatRideUpdateDate } from "@/lib/track";

export function StatusCard({
  latestPosition,
  snapshot,
  state,
  trackerStatus,
  update,
  nowMs,
}: {
  latestPosition: RidePosition | null;
  snapshot: TrackerSnapshot | null;
  state: "pre_ride" | "live" | "finished";
  trackerStatus: TrackerStatus;
  update: RideUpdate | null;
  nowMs: number | null;
}) {
  const batteryLabel = latestPosition?.batteryPct !== null && latestPosition?.batteryPct !== undefined ? `${Math.round(latestPosition.batteryPct)}% battery` : "Battery unavailable";
  const speedLabel = latestPosition?.speedMps ? `${(latestPosition.speedMps * 3.6).toFixed(1)} km/h` : "Speed unavailable";

  // The card renders the same sections in pre-ride and live so the page
  // layout doesn't shift when the ride flips on. Pre-ride values fall back
  // to "Awaiting feed" / placeholder copy; once positions stream in the
  // same markup lights up with real data.
  const headline =
    state === "finished"
      ? "Ride summary"
      : snapshot?.locationLabel ?? update?.location ?? "Live ride";

  return (
    <aside className="rounded-4xl border border-white/8 bg-surface p-7 text-foreground md:p-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-foreground/50">Tracker state</p>
          <p className="mt-3 text-3xl font-medium tracking-tight">{headline}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-1.5">
          <span className={`h-2 w-2 rounded-full ${modeDotClass(trackerStatus)}`} aria-hidden />
          <span className="whitespace-nowrap text-[0.7rem] font-medium uppercase tracking-[0.22em] text-foreground/85">
            {formatTrackerStatus(trackerStatus)}
          </span>
        </div>
      </div>

      {snapshot ? (
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
        <Item label="Tracking via" value={snapshot?.source === "live" ? "Live GPS signal" : "Team check-ins"} />
      </div>
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
    <div className="rounded-2xl border border-white/10 bg-white/4 p-4">
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

/**
 * Display label for the tracker mode pill. The DB value uses snake_case
 * ("pre_ride") which reads awkwardly in the UI; these single-word labels
 * fit cleanly on one line next to the status dot.
 */
function formatTrackerStatus(status: TrackerStatus) {
  if (status === "live") return "Live";
  if (status === "finished") return "Finished";
  return "Pre-ride";
}

/**
 * Color of the 2×2 indicator dot in the mode pill — green while the ride
 * is live, amber before it starts, muted grey once it's wrapped.
 */
function modeDotClass(status: TrackerStatus) {
  if (status === "live") return "bg-emerald-400";
  if (status === "finished") return "bg-foreground/40";
  return "bg-amber-400";
}
