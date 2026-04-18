import type { RidePosition, RideUpdate, RouteContent, TrackerStatus } from "@/lib/fallback-content";
import type { Database } from "@/types/db";

type RideUpdateRow = Database["public"]["Tables"]["ride_updates"]["Row"];
type RidePositionRow = Database["public"]["Tables"]["ride_positions"]["Row"];

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

export function mapRidePosition(row: RidePositionRow): RidePosition {
  return {
    id: row.id,
    recordedAt: row.recorded_at,
    lat: Number(row.lat),
    lon: Number(row.lon),
    accuracyM: row.accuracy_m === null ? null : Number(row.accuracy_m),
    speedMps: row.speed_mps === null ? null : Number(row.speed_mps),
    batteryPct: row.battery_pct === null ? null : Number(row.battery_pct),
    source: row.source,
  };
}

export function getTrackerSnapshot(route: RouteContent, update: RideUpdate) {
  const totalDistanceKm = Math.max(route.totalDistanceKm, 1);
  const progressPercent = Math.max(0, Math.min(100, (update.kmCompleted / totalDistanceKm) * 100));
  const checkpoints = route.checkpoints.map((checkpoint) => ({
    ...checkpoint,
    km: checkpoint.km,
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

export function formatCountdown(rideDate: string, now = new Date()) {
  const diffMs = new Date(rideDate).getTime() - now.getTime();
  if (diffMs <= 0) {
    return "Tracker activates on ride day";
  }

  const totalMinutes = Math.floor(diffMs / 60000);
  const days = Math.floor(totalMinutes / (60 * 24));
  const hours = Math.floor((totalMinutes % (60 * 24)) / 60);
  const minutes = totalMinutes % 60;

  if (days > 0) {
    return `${days}d ${hours}h until rollout`;
  }

  return `${hours}h ${minutes}m until rollout`;
}

export function deriveSignalStatus(position: RidePosition | null, now = new Date()) {
  if (!position) {
    return "Manual updates only";
  }

  const ageMinutes = (now.getTime() - new Date(position.recordedAt).getTime()) / 60000;
  if (ageMinutes <= 3) {
    return "Live signal";
  }
  if (ageMinutes <= 15) {
    return "Delayed signal";
  }
  return "Signal stale";
}

export function deriveTrackerState({
  trackerStatus,
  rideDate,
  latestPosition,
}: {
  trackerStatus: TrackerStatus;
  rideDate: string;
  latestPosition: RidePosition | null;
}) {
  if (trackerStatus === "finished") {
    return "finished" as const;
  }

  if (trackerStatus === "live") {
    return "live" as const;
  }

  if (!latestPosition && new Date(rideDate).getTime() > Date.now()) {
    return "pre_ride" as const;
  }

  return latestPosition ? ("live" as const) : ("pre_ride" as const);
}
