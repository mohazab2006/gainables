import type { RideUpdate, RouteContent } from "@/lib/fallback-content";

export function StatusCard({ route, update }: { route: RouteContent; update: RideUpdate }) {
  return (
    <aside className="rounded-[2rem] border border-border bg-foreground p-8 text-background md:p-10">
      <p className="text-sm uppercase tracking-[0.28em] text-background/60">Manual status</p>
      <div className="mt-8 space-y-6">
        <Item label="Current location" value={update.location} />
        <Item label="Distance completed" value={`${update.kmCompleted} / ${route.totalDistanceKm} km`} />
        <Item label="Next checkpoint" value={update.nextCheckpoint} />
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
