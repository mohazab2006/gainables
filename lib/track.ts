import type { RidePosition, RideUpdate, RouteContent, TrackerStatus } from "@/lib/fallback-content";
import type { Database } from "@/types/db";

type RideUpdateRow = Database["public"]["Tables"]["ride_updates"]["Row"];
type RidePositionRow = Database["public"]["Tables"]["ride_positions"]["Row"];

type Checkpoint = RouteContent["checkpoints"][number];

export type TrackerSnapshot = {
  progressPercent: number;
  remainingKm: number;
  totalDistanceKm: number;
  completedCheckpointCount: number;
  checkpointCount: number;
  currentCheckpoint: Checkpoint | null;
  nextCheckpoint: Checkpoint | null;
  checkpoints: Checkpoint[];
  kmCompleted: number;
  locationLabel: string;
  source: "live" | "manual";
};

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
    mediaUrl: row.media_url,
    mediaKind: row.media_kind,
    mediaAlt: row.media_alt,
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

export function getTrackerSnapshot(route: RouteContent, update: Pick<RideUpdate, "kmCompleted" | "nextCheckpoint" | "location">): TrackerSnapshot {
  const totalDistanceKm = Math.max(route.totalDistanceKm, 1);
  const kmCompleted = Math.max(0, Math.min(totalDistanceKm, update.kmCompleted));
  const progressPercent = Math.max(0, Math.min(100, (kmCompleted / totalDistanceKm) * 100));
  const checkpoints = route.checkpoints.map((checkpoint) => ({
    ...checkpoint,
    km: checkpoint.km,
  }));
  const completedCheckpointCount = checkpoints.filter((checkpoint) => kmCompleted >= checkpoint.km).length;
  const currentCheckpoint =
    [...checkpoints].reverse().find((checkpoint) => kmCompleted >= checkpoint.km) ?? checkpoints[0] ?? null;
  const nextCheckpoint =
    checkpoints.find((checkpoint) => checkpoint.name === update.nextCheckpoint) ??
    checkpoints.find((checkpoint) => checkpoint.km > kmCompleted) ??
    checkpoints.at(-1) ??
    null;

  return {
    progressPercent,
    remainingKm: Math.max(0, totalDistanceKm - kmCompleted),
    totalDistanceKm,
    completedCheckpointCount,
    checkpointCount: checkpoints.length,
    currentCheckpoint,
    nextCheckpoint,
    checkpoints,
    kmCompleted,
    locationLabel: update.location,
    source: "manual",
  };
}

export function resolveTrackerSnapshot({
  route,
  latestPosition,
  latestUpdate,
  nowMs = Date.now(),
}: {
  route: RouteContent;
  latestPosition: RidePosition | null;
  latestUpdate: RideUpdate | null;
  nowMs?: number;
}): TrackerSnapshot | null {
  const liveUsable = isLiveTelemetryUsable(latestPosition, nowMs);
  if (latestPosition && (liveUsable || !latestUpdate)) {
    return getLiveTrackerSnapshot(route, latestPosition);
  }

  if (latestUpdate) {
    return getTrackerSnapshot(route, latestUpdate);
  }

  if (latestPosition) {
    return getLiveTrackerSnapshot(route, latestPosition);
  }

  return null;
}

export function formatCountdown(rideDate: string, nowMs?: number | null) {
  if (nowMs === undefined || nowMs === null) {
    return "Tracker activates on ride day";
  }

  const diffMs = new Date(rideDate).getTime() - nowMs;
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

export function deriveSignalStatus(position: RidePosition | null, nowMs?: number | null) {
  if (!position) {
    return "Manual updates only";
  }

  if (nowMs === undefined || nowMs === null) {
    return "Syncing signal";
  }

  const ageMinutes = (nowMs - new Date(position.recordedAt).getTime()) / 60000;
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
  latestPosition,
}: {
  trackerStatus: TrackerStatus;
  latestPosition: RidePosition | null;
}) {
  if (trackerStatus === "finished") {
    return "finished" as const;
  }

  if (trackerStatus === "live") {
    return "live" as const;
  }

  if (!latestPosition) {
    return "pre_ride" as const;
  }

  return "live" as const;
}

export function isLiveTelemetryUsable(position: RidePosition | null, nowMs = Date.now()) {
  if (!position) {
    return false;
  }
  return nowMs - new Date(position.recordedAt).getTime() <= 15 * 60_000;
}

function getLiveTrackerSnapshot(route: RouteContent, latestPosition: RidePosition): TrackerSnapshot {
  const totalDistanceKm = Math.max(route.totalDistanceKm, 1);
  const projectedKm = projectPositionOntoRoute(route, latestPosition);
  const kmCompleted = Math.max(0, Math.min(totalDistanceKm, projectedKm));
  const progressPercent = Math.max(0, Math.min(100, (kmCompleted / totalDistanceKm) * 100));
  const checkpoints = route.checkpoints.map((checkpoint) => ({
    ...checkpoint,
    km: checkpoint.km,
  }));
  const completedCheckpointCount = checkpoints.filter((checkpoint) => kmCompleted >= checkpoint.km).length;
  const currentCheckpoint =
    [...checkpoints].reverse().find((checkpoint) => kmCompleted >= checkpoint.km) ?? checkpoints[0] ?? null;
  const nextCheckpoint = checkpoints.find((checkpoint) => checkpoint.km > kmCompleted) ?? checkpoints.at(-1) ?? null;

  return {
    progressPercent,
    remainingKm: Math.max(0, totalDistanceKm - kmCompleted),
    totalDistanceKm,
    completedCheckpointCount,
    checkpointCount: checkpoints.length,
    currentCheckpoint,
    nextCheckpoint,
    checkpoints,
    kmCompleted,
    locationLabel: describeLiveLocation(currentCheckpoint, nextCheckpoint, progressPercent),
    source: "live",
  };
}

function describeLiveLocation(currentCheckpoint: Checkpoint | null, nextCheckpoint: Checkpoint | null, progressPercent: number) {
  if (progressPercent >= 100) {
    return nextCheckpoint?.name ?? currentCheckpoint?.name ?? "Finish";
  }

  if (nextCheckpoint && currentCheckpoint && nextCheckpoint.name !== currentCheckpoint.name) {
    return `Approaching ${nextCheckpoint.name}`;
  }

  if (currentCheckpoint) {
    return currentCheckpoint.name;
  }

  return "On route";
}

function projectPositionOntoRoute(route: RouteContent, latestPosition: RidePosition) {
  const polyline = route.polyline.length
    ? route.polyline
    : route.checkpoints.map((checkpoint) => ({ lat: checkpoint.lat, lng: checkpoint.lng }));
  if (polyline.length < 2) {
    return 0;
  }

  const refLat = latestPosition.lat;
  const target = projectPoint(latestPosition.lon, latestPosition.lat, refLat);
  let cumulativeMeters = 0;
  let bestMeters = 0;
  let bestDistanceSq = Number.POSITIVE_INFINITY;

  for (let index = 0; index < polyline.length - 1; index += 1) {
    const start = polyline[index];
    const end = polyline[index + 1];
    const startXY = projectPoint(start.lng, start.lat, refLat);
    const endXY = projectPoint(end.lng, end.lat, refLat);
    const segment = { x: endXY.x - startXY.x, y: endXY.y - startXY.y };
    const segmentLengthSq = segment.x * segment.x + segment.y * segment.y;
    if (segmentLengthSq === 0) {
      continue;
    }

    const t = clamp(
      ((target.x - startXY.x) * segment.x + (target.y - startXY.y) * segment.y) / segmentLengthSq,
      0,
      1,
    );
    const projection = {
      x: startXY.x + segment.x * t,
      y: startXY.y + segment.y * t,
    };
    const distanceSq = (target.x - projection.x) ** 2 + (target.y - projection.y) ** 2;
    const segmentLength = Math.sqrt(segmentLengthSq);

    if (distanceSq < bestDistanceSq) {
      bestDistanceSq = distanceSq;
      bestMeters = cumulativeMeters + segmentLength * t;
    }

    cumulativeMeters += segmentLength;
  }

  return bestMeters / 1000;
}

function projectPoint(lng: number, lat: number, refLat: number) {
  const metersPerDegLat = 111_320;
  const metersPerDegLng = Math.cos((refLat * Math.PI) / 180) * metersPerDegLat;
  return {
    x: lng * metersPerDegLng,
    y: lat * metersPerDegLat,
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}
