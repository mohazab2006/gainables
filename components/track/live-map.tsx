"use client";

import { useEffect, useRef, useState } from "react";
import type { ExpressionSpecification, GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";

import type { RidePosition, RouteContent } from "@/lib/fallback-content";

type Checkpoint = RouteContent["checkpoints"][number] & {
  lat: number;
  lng: number;
};

type LiveMapProps = {
  checkpoints: Checkpoint[];
  mapboxToken?: string;
  positions: RidePosition[];
  progressPercent: number;
  route: RouteContent;
  routeFeature: {
    type: "Feature";
    properties?: Record<string, unknown>;
    geometry: {
      type: "LineString";
      coordinates: [number, number][];
    };
  };
  state: "pre_ride" | "live" | "finished";
};

// Brand palette — kept in one place so any future tweak stays consistent.
const COLORS = {
  accent: "#C8E25C",
  accentGlow: "rgba(200,226,92,0.35)",
  trail: "#C8E25C",
  routeRemaining: "#2a2a2a",
  routeRemainingGlow: "rgba(255,255,255,0.06)",
  checkpoint: "#ffffff",
  checkpointRing: "#C8E25C",
  textDark: "#0a0a0a",
} as const;

export function LiveMap({ checkpoints, mapboxToken, positions, progressPercent, route, routeFeature, state }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<Marker | null>(null);
  const followRef = useRef(true);
  const [followEnabled, setFollowEnabled] = useState(true);
  const latestPosition = positions.at(-1) ?? null;

  useEffect(() => {
    if (!mapboxToken || !mapRef.current) {
      return;
    }

    let cancelled = false;
    let dashInterval: ReturnType<typeof setInterval> | null = null;
    const container = mapRef.current;

    async function start() {
      const mapboxModule = await import("mapbox-gl");
      const mapboxgl = mapboxModule.default ?? mapboxModule;
      if (cancelled || !container) {
        return;
      }
      mapboxgl.accessToken = mapboxToken;

      if (container.childElementCount > 0) {
        container.replaceChildren();
      }

      const initialBounds = new mapboxgl.LngLatBounds();
      routeFeature.geometry.coordinates.forEach((point) => initialBounds.extend(point));

      const containerRect = container.getBoundingClientRect();
      const fallbackZoom = estimateZoomForBounds(initialBounds, containerRect);
      const initialCenter: [number, number] = initialBounds.isEmpty()
        ? [route.mapCenter.lng, route.mapCenter.lat]
        : (initialBounds.getCenter().toArray() as [number, number]);

      const map = new mapboxgl.Map({
        container,
        style: "mapbox://styles/mapbox/dark-v11",
        center: initialCenter,
        zoom: initialBounds.isEmpty() ? route.mapCenter.zoom : fallbackZoom,
        pitch: 45,
        bearing: -12,
        antialias: true,
        attributionControl: false,
      });

      if (cancelled) {
        map.remove();
        return;
      }

      instanceRef.current = map;

      // Discreet attribution pinned bottom-right (required by Mapbox ToS).
      map.addControl(new mapboxgl.AttributionControl({ compact: true }), "bottom-right");

      map.on("dragstart", () => {
        followRef.current = false;
        setFollowEnabled(false);
      });

      map.on("load", () => {
        if (cancelled) {
          return;
        }

        // 3D terrain — exaggerate elevation slightly so the Laurentians + river
        // valleys read as texture in the background, not a flat plane.
        if (!map.getSource("mapbox-dem")) {
          map.addSource("mapbox-dem", {
            type: "raster-dem",
            url: "mapbox://mapbox.mapbox-terrain-dem-v1",
            tileSize: 512,
            maxzoom: 14,
          });
        }
        map.setTerrain({ source: "mapbox-dem", exaggeration: 1.4 });

        // Atmospheric sky so the tilted horizon doesn't just fade into flat color.
        if (!map.getLayer("sky")) {
          map.addLayer({
            id: "sky",
            type: "sky",
            paint: {
              "sky-type": "atmosphere",
              "sky-atmosphere-sun": [-1.2, 70.0],
              "sky-atmosphere-sun-intensity": 8,
              "sky-atmosphere-halo-color": "rgba(200,226,92,0.35)",
              "sky-atmosphere-color": "rgba(12,12,12,0.9)",
            },
          });
        }

        // Subtle fog tint far from the camera — kills the "hard edge" of the earth.
        map.setFog({
          color: "rgb(18,18,18)",
          "high-color": "rgb(36,36,36)",
          "horizon-blend": 0.12,
          "space-color": "rgb(8,8,8)",
          "star-intensity": 0.3,
        });

        // lineMetrics is required for line-gradient to work with line-progress.
        map.addSource("route", {
          type: "geojson",
          lineMetrics: true,
          data: {
            ...routeFeature,
            properties: routeFeature.properties ?? {},
          },
        });

        // Outer glow — wide, soft, underneath everything.
        map.addLayer({
          id: "route-glow",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-color": COLORS.accent,
            "line-width": 16,
            "line-opacity": 0.12,
            "line-blur": 8,
          },
        });

        // The base route line: gradient from accent (completed) to dark (remaining).
        map.addLayer({
          id: "route-progress",
          type: "line",
          source: "route",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: {
            "line-width": 5,
            "line-gradient": buildProgressGradient(progressPercent),
          },
        });

        // Animated dashed overlay → reads as "motion" on the active/completed portion.
        map.addLayer({
          id: "route-dash",
          type: "line",
          source: "route",
          layout: { "line-cap": "butt", "line-join": "round" },
          paint: {
            "line-color": "#ffffff",
            "line-width": 2,
            "line-opacity": 0.55,
            "line-dasharray": [0, 4, 3],
          },
        });

        // Gently animate the dash offset for a nav-style flow effect.
        const dashSteps: [number, number, number][] = [
          [0, 4, 3],
          [1, 4, 2],
          [2, 4, 1],
          [3, 4, 0],
          [0, 1, 3, 3],
          [0, 2, 3, 2],
          [0, 3, 3, 1],
        ] as unknown as [number, number, number][];
        let dashIndex = 0;
        dashInterval = setInterval(() => {
          if (cancelled || !map.getLayer("route-dash")) {
            return;
          }
          dashIndex = (dashIndex + 1) % dashSteps.length;
          try {
            map.setPaintProperty("route-dash", "line-dasharray", dashSteps[dashIndex]);
          } catch {
            // Style may be mid-reload; skip this frame.
          }
        }, 110);

        // Checkpoint layer — rings in accent with a dark dot inside.
        map.addSource("checkpoints", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: checkpoints.map((checkpoint, index) => ({
              type: "Feature" as const,
              geometry: {
                type: "Point" as const,
                coordinates: [checkpoint.lng, checkpoint.lat],
              },
              properties: {
                name: checkpoint.name,
                stage: checkpoint.stage,
                isEndpoint: index === 0 || index === checkpoints.length - 1,
              },
            })),
          },
        });

        map.addLayer({
          id: "checkpoint-halo",
          type: "circle",
          source: "checkpoints",
          paint: {
            "circle-radius": 14,
            "circle-color": COLORS.accent,
            "circle-opacity": 0.18,
            "circle-blur": 0.6,
          },
        });

        map.addLayer({
          id: "checkpoint-points",
          type: "circle",
          source: "checkpoints",
          paint: {
            "circle-radius": ["case", ["get", "isEndpoint"], 8, 6],
            "circle-color": COLORS.textDark,
            "circle-stroke-width": 2.5,
            "circle-stroke-color": COLORS.accent,
          },
        });

        map.addLayer({
          id: "checkpoint-labels",
          type: "symbol",
          source: "checkpoints",
          layout: {
            "text-field": ["get", "name"],
            "text-font": ["DIN Pro Medium", "Arial Unicode MS Regular"],
            "text-size": 12,
            "text-offset": [0, 1.4],
            "text-anchor": "top",
            "text-letter-spacing": 0.06,
            "text-transform": "uppercase",
          },
          paint: {
            "text-color": "#f2f2f2",
            "text-halo-color": "rgba(0,0,0,0.85)",
            "text-halo-width": 1.2,
          },
        });

        // Custom bike marker — themed circle with a bike icon.
        const markerEl = buildBikeMarkerElement();
        const startOfRoute = routeFeature.geometry.coordinates[0];
        const firstCheckpoint = checkpoints[0];
        const markerPoint: [number, number] = latestPosition
          ? [latestPosition.lon, latestPosition.lat]
          : startOfRoute
            ? [startOfRoute[0], startOfRoute[1]]
            : firstCheckpoint
              ? [firstCheckpoint.lng, firstCheckpoint.lat]
              : [route.mapCenter.lng, route.mapCenter.lat];

        markerRef.current = new mapboxgl.Marker({ element: markerEl, anchor: "center" })
          .setLngLat(markerPoint)
          .addTo(map);

        const fitRoute = () => {
          if (cancelled || initialBounds.isEmpty()) {
            return;
          }
          map.resize();
          const camera = map.cameraForBounds(initialBounds, {
            padding: { top: 72, right: 72, bottom: 72, left: 72 },
            maxZoom: 10.5,
            pitch: 45,
            bearing: -12,
          });
          if (camera) {
            map.jumpTo({
              center: camera.center ?? initialCenter,
              zoom: typeof camera.zoom === "number" ? camera.zoom : fallbackZoom,
              pitch: 45,
              bearing: -12,
            });
          } else {
            map.jumpTo({ center: initialCenter, zoom: fallbackZoom, pitch: 45, bearing: -12 });
          }
        };

        fitRoute();
        requestAnimationFrame(fitRoute);
        map.once("idle", fitRoute);
      });
    }

    void start();

    return () => {
      cancelled = true;
      if (dashInterval) clearInterval(dashInterval);
      markerRef.current?.remove();
      markerRef.current = null;
      instanceRef.current?.remove();
      instanceRef.current = null;
      followRef.current = true;
    };
  }, [checkpoints, mapboxToken, route.mapCenter.lat, route.mapCenter.lng, route.mapCenter.zoom, routeFeature]);

  // Keep the live trail + progress gradient in sync with streaming positions.
  useEffect(() => {
    if (!instanceRef.current) {
      return;
    }

    const map = instanceRef.current;

    if (map.getLayer("route-progress")) {
      try {
        map.setPaintProperty("route-progress", "line-gradient", buildProgressGradient(progressPercent));
      } catch {
        // Layer may not be ready on first render.
      }
    }

    if (!latestPosition) {
      return;
    }

    markerRef.current?.setLngLat([latestPosition.lon, latestPosition.lat]);

    if (followRef.current) {
      map.easeTo({
        center: [latestPosition.lon, latestPosition.lat],
        duration: 900,
        zoom: Math.max(map.getZoom(), route.mapCenter.zoom),
        pitch: 55,
      });
    }
  }, [latestPosition, progressPercent, route.mapCenter.zoom]);

  // Keep the trail data pushing through — separate from progress so replays
  // of historical positions rebuild the polyline without re-triggering camera.
  useEffect(() => {
    const map = instanceRef.current;
    if (!map) return;
    const trail = map.getSource("trail") as GeoJSONSource | undefined;
    if (!trail) {
      // Source doesn't exist in this simplified gradient-only design — no-op.
      return;
    }
    trail.setData(buildTrailFeature(positions));
  }, [positions]);

  if (!mapboxToken) {
    return (
      <div className="flex min-h-136 flex-col justify-between rounded-[1.85rem] bg-[linear-gradient(165deg,#0f0f0f,#2a2a2a)] p-8 text-white">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/60">Mapbox not configured</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight">
            The route is ready, but the live map needs <code className="rounded bg-white/10 px-2 py-1 text-xl">NEXT_PUBLIC_MAPBOX_TOKEN</code>.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
            Manual ride updates still work, and the live position stream will light up as soon as the public token is added.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-5">
          {checkpoints.map((checkpoint) => (
            <div key={checkpoint.name} className="rounded-3xl border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">{checkpoint.stage}</p>
              <p className="mt-2 text-lg font-medium">{checkpoint.name}</p>
              <p className="mt-2 text-sm text-white/65">{checkpoint.distanceLabel}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.85rem] border border-white/5 bg-[#0a0a0a] shadow-[0_40px_120px_rgba(0,0,0,0.35)]">
      <div ref={mapRef} className="h-136 w-full bg-[linear-gradient(135deg,#0a0a0a,#1a1a1a)] md:h-168" />

      {/* Top-left live status pills — glassy dark to sit on the map */}
      <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-2">
        <DarkPill label="State" value={state.replace("_", " ")} tone={state === "live" ? "live" : state === "finished" ? "done" : "idle"} />
        <DarkPill label="Progression" value={`${Math.round(progressPercent)}%`} />
        <DarkPill label="Camera" value={followEnabled ? "Follow" : "Free"} />
      </div>

      {/* Gradient vignette at the top so labels read over any map color */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-28 bg-[linear-gradient(to_bottom,rgba(0,0,0,0.55),transparent)]"
      />

      {!followEnabled && latestPosition ? (
        <button
          type="button"
          onClick={() => {
            followRef.current = true;
            setFollowEnabled(true);
            instanceRef.current?.easeTo({
              center: [latestPosition.lon, latestPosition.lat],
              duration: 900,
              zoom: Math.max(instanceRef.current.getZoom(), route.mapCenter.zoom),
              pitch: 55,
            });
          }}
          className="absolute bottom-4 right-4 rounded-full bg-accent px-4 py-2 text-sm font-medium text-foreground shadow-[0_12px_36px_rgba(200,226,92,0.45)] transition hover:-translate-y-0.5"
        >
          Recenter rider
        </button>
      ) : null}
    </div>
  );
}

function estimateZoomForBounds(
  bounds: { isEmpty: () => boolean; getWest: () => number; getEast: () => number; getNorth: () => number; getSouth: () => number },
  container: { width: number; height: number },
): number {
  if (bounds.isEmpty() || container.width <= 0 || container.height <= 0) {
    return 9;
  }
  const paddingPx = 96;
  const widthPx = Math.max(200, container.width - paddingPx);
  const heightPx = Math.max(200, container.height - paddingPx);
  const latSpan = Math.max(Math.abs(bounds.getNorth() - bounds.getSouth()), 0.05);
  const lngSpan = Math.max(Math.abs(bounds.getEast() - bounds.getWest()), 0.05);
  const centerLat = (bounds.getNorth() + bounds.getSouth()) / 2;
  const latRad = (centerLat * Math.PI) / 180;
  const lngZoom = Math.log2((widthPx * 360) / (lngSpan * 512));
  const latZoom = Math.log2((heightPx * 360) / (latSpan * 512 * Math.cos(latRad)));
  return Math.min(Math.max(Math.min(lngZoom, latZoom) - 0.1, 6), 11);
}

function buildTrailFeature(positions: RidePosition[]) {
  return {
    type: "FeatureCollection" as const,
    features:
      positions.length > 1
        ? [
            {
              type: "Feature" as const,
              properties: {},
              geometry: {
                type: "LineString" as const,
                coordinates: positions.map((position) => [position.lon, position.lat] as [number, number]),
              },
            },
          ]
        : [],
  };
}

// Splits the route gradient at the current progress so the completed portion
// glows in accent and the remaining portion stays muted dark.
function buildProgressGradient(progressPercent: number) {
  const pct = Math.max(0, Math.min(100, progressPercent)) / 100;
  // Clamp slightly off the exact 0/1 to keep Mapbox happy with line-gradient
  // expressions that require strictly increasing stops.
  const cutoff = Math.max(0.001, Math.min(0.999, pct));
  return [
    "interpolate",
    ["linear"],
    ["line-progress"],
    0,
    COLORS.accent,
    cutoff,
    COLORS.accent,
    Math.min(cutoff + 0.001, 0.999),
    COLORS.routeRemaining,
    1,
    COLORS.routeRemaining,
  ] as unknown as ExpressionSpecification;
}

// Mapbox marker API needs a real DOM node — easier to build it inline than
// try to portal a React tree onto the marker.
function buildBikeMarkerElement(): HTMLDivElement {
  const wrapper = document.createElement("div");
  wrapper.className = "gainables-bike-marker";
  wrapper.style.width = "44px";
  wrapper.style.height = "44px";
  wrapper.style.display = "flex";
  wrapper.style.alignItems = "center";
  wrapper.style.justifyContent = "center";
  wrapper.style.position = "relative";
  wrapper.innerHTML = `
    <span style="
      position:absolute;
      inset:-10px;
      border-radius:9999px;
      background:radial-gradient(closest-side, rgba(200,226,92,0.55), rgba(200,226,92,0.12) 60%, transparent 80%);
      filter:blur(2px);
      animation: gainables-pulse 2.2s ease-in-out infinite;
    "></span>
    <span style="
      position:relative;
      display:flex;
      align-items:center;
      justify-content:center;
      width:36px;
      height:36px;
      border-radius:9999px;
      background:#C8E25C;
      color:#0a0a0a;
      box-shadow:0 6px 18px rgba(0,0,0,0.45), 0 0 0 3px rgba(0,0,0,0.75);
    ">
      <svg viewBox='0 0 24 24' width='20' height='20' fill='none' stroke='currentColor' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' aria-hidden='true'>
        <circle cx='5.5' cy='17.5' r='3.5'/>
        <circle cx='18.5' cy='17.5' r='3.5'/>
        <path d='M15 6a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm-3 11.5 3-6 4 4M6.5 17.5 12 6'/>
      </svg>
    </span>
  `;

  // Inject the keyframes once (marker is re-created on every mount but the
  // style tag gets deduped by its id).
  if (typeof document !== "undefined" && !document.getElementById("gainables-bike-marker-styles")) {
    const style = document.createElement("style");
    style.id = "gainables-bike-marker-styles";
    style.textContent = `
      @keyframes gainables-pulse {
        0%   { transform: scale(0.9); opacity: 0.95; }
        50%  { transform: scale(1.15); opacity: 0.55; }
        100% { transform: scale(0.9); opacity: 0.95; }
      }
    `;
    document.head.appendChild(style);
  }

  return wrapper;
}

type DarkPillTone = "idle" | "live" | "done" | undefined;

function DarkPill({ label, value, tone }: { label: string; value: string; tone?: DarkPillTone }) {
  const dotColor =
    tone === "live" ? "bg-accent" : tone === "done" ? "bg-white" : "bg-white/40";
  return (
    <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-white/10 bg-black/55 px-3.5 py-1.5 text-[0.65rem] uppercase tracking-[0.22em] text-white/85 shadow-[0_8px_30px_rgba(0,0,0,0.35)] backdrop-blur-md">
      {tone ? (
        <span className="relative inline-flex h-2 w-2">
          {tone === "live" ? (
            <span className={`absolute inline-flex h-full w-full animate-ping rounded-full ${dotColor} opacity-70`} />
          ) : null}
          <span className={`relative inline-flex h-2 w-2 rounded-full ${dotColor}`} />
        </span>
      ) : null}
      <span className="text-white/50">{label}</span>
      <span className="font-medium text-white">{value}</span>
    </div>
  );
}
