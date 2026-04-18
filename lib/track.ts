import type { RideUpdate, RouteContent } from "@/lib/fallback-content";
import type { Database } from "@/types/db";

type RideUpdateRow = Database["public"]["Tables"]["ride_updates"]["Row"];

export function mapRideUpdate(row: RideUpdateRow, fallbackCoordinates: Pick<RideUpdate, "lat" | "lng">): RideUpdate {
  return {
    id: row.id,
    createdAt: row.created_at,
    createdAtLabel: formatRideUpdateTime(row.created_at),
    location: row.location,
    kmCompleted: Number(row.km_completed),
    nextCheckpoint: row.next_checkpoint,
    message: row.message,
    lat: row.lat ?? fallbackCoordinates.lat,
    lng: row.lng ?? fallbackCoordinates.lng,
  };
}

export function formatRideUpdateTime(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function formatRideUpdateDate(iso: string) {
  return new Intl.DateTimeFormat("en-CA", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(iso));
}

export function getTrackerSnapshot(route: RouteContent, update: RideUpdate) {
  const totalDistanceKm = Math.max(route.totalDistanceKm, 1);
  const progressPercent = Math.max(0, Math.min(100, (update.kmCompleted / totalDistanceKm) * 100));
  const checkpoints = route.checkpoints.map((checkpoint) => ({
    ...checkpoint,
    km: parseCheckpointDistance(checkpoint.distance),
  }));
  const completedCheckpointCount = checkpoints.filter((checkpoint) => update.kmCompleted >= checkpoint.km).length;
  const currentCheckpoint =
    [...checkpoints].reverse().find((checkpoint) => update.kmCompleted >= checkpoint.km) ?? checkpoints[0] ?? null;
  const nextCheckpoint =
    checkpoints.find((checkpoint) => checkpoint.name === update.nextCheckpoint) ??
    checkpoints.find((checkpoint) => checkpoint.km > update.kmCompleted) ??
    checkpoints.at(-1) ??
    null;

  return {
    progressPercent,
    remainingKm: Math.max(0, totalDistanceKm - update.kmCompleted),
    totalDistanceKm,
    completedCheckpointCount,
    checkpointCount: checkpoints.length,
    currentCheckpoint,
    nextCheckpoint,
    checkpoints,
  };
}

function parseCheckpointDistance(distance: string) {
  const numeric = Number.parseFloat(distance.replace(/[^0-9.]/g, ""));
  return Number.isFinite(numeric) ? numeric : 0;
}
