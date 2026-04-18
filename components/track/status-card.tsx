import type { RideUpdate, RouteContent } from "@/lib/fallback-content";
import { formatRideUpdateDate, getTrackerSnapshot } from "@/lib/track";

export function StatusCard({ route, update }: { route: RouteContent; update: RideUpdate }) {
  const snapshot = getTrackerSnapshot(route, update);
  const checkpointSummary = snapshot.nextCheckpoint
    ? `${snapshot.completedCheckpointCount} of ${snapshot.checkpointCount} checkpoints cleared`
    : "Final checkpoint ahead";

  return (
    <aside className="rounded-[2rem] border border-border bg-foreground p-8 text-background md:p-10">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.28em] text-background/60">Ride status</p>
          <p className="mt-3 text-3xl font-medium tracking-tight">{update.location}</p>
        </div>
        <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-right">
          <p className="text-[0.7rem] uppercase tracking-[0.24em] text-background/55">Updated</p>
          <p className="mt-1 text-sm font-medium">{formatRideUpdateDate(update.createdAt)}</p>
        </div>
      </div>

      <div className="mt-8 rounded-[1.75rem] border border-white/10 bg-white/5 p-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-background/55">Distance covered</p>
            <p className="mt-2 text-3xl font-medium tracking-tight">{Math.round(snapshot.progressPercent)}%</p>
          </div>
          <p className="text-sm text-background/65">
            {update.kmCompleted} / {snapshot.totalDistanceKm} km
          </p>
        </div>
        <div className="mt-4 h-2 rounded-full bg-white/10">
          <div className="h-full rounded-full bg-background transition-[width]" style={{ width: `${snapshot.progressPercent}%` }} />
        </div>
        <p className="mt-4 text-sm text-background/70">{checkpointSummary}</p>
      </div>

      <div className="mt-6 flex flex-wrap gap-3">
        {snapshot.checkpoints.map((checkpoint) => {
          const state =
            snapshot.nextCheckpoint?.name === checkpoint.name
              ? "next"
              : update.kmCompleted >= checkpoint.km
                ? "complete"
                : "upcoming";

          return (
            <div
              key={checkpoint.name}
              className={[
                "rounded-full border px-4 py-2 text-sm transition-colors",
                state === "complete"
                  ? "border-transparent bg-background text-foreground"
                  : state === "next"
                    ? "border-background/35 bg-white/10 text-background"
                    : "border-white/10 bg-transparent text-background/60",
              ].join(" ")}
            >
              <span className="mr-2 text-[0.65rem] uppercase tracking-[0.2em] opacity-70">{checkpoint.stage}</span>
              <span className="font-medium">{checkpoint.name}</span>
            </div>
          );
        })}
      </div>

      <div className="mt-8 space-y-6">
        <Item label="Current checkpoint" value={snapshot.currentCheckpoint?.name ?? update.location} />
        <Item label="Next checkpoint" value={snapshot.nextCheckpoint?.name ?? update.nextCheckpoint} />
        <Item label="Latest message" value={update.message} />
      </div>
    </aside>
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
