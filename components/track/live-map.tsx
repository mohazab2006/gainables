"use client";

import { useEffect, useRef, useState } from "react";
import type { GeoJSONSource, Map as MapboxMap, Marker } from "mapbox-gl";

import type { RidePosition, RouteContent } from "@/lib/fallback-content";

type Checkpoint = RouteContent["checkpoints"][number] & {
  lat: number;
  lng: number;
};

type LiveMapProps = {
  checkpoints: Checkpoint[];
  mapboxToken?: string;
  positions: RidePosition[];
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

export function LiveMap({ checkpoints, mapboxToken, positions, route, routeFeature, state }: LiveMapProps) {
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

    async function start() {
      const mapboxgl = await import("mapbox-gl");
      mapboxgl.default.accessToken = mapboxToken;

      const map = new mapboxgl.default.Map({
        container: mapRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [route.mapCenter.lng, route.mapCenter.lat],
        zoom: route.mapCenter.zoom,
      });

      instanceRef.current = map;

      map.on("dragstart", () => {
        followRef.current = false;
        setFollowEnabled(false);
      });

      map.on("load", () => {
        if (cancelled) {
          return;
        }

        const bounds = new mapboxgl.LngLatBounds();
        routeFeature.geometry.coordinates.forEach((point) => bounds.extend(point));

        map.addSource("route", {
          type: "geojson",
          data: {
            ...routeFeature,
            properties: routeFeature.properties ?? {},
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#111111",
            "line-width": 5,
            "line-opacity": 0.35,
          },
        });

        map.addSource("trail", {
          type: "geojson",
          data: buildTrailFeature(positions),
        });

        map.addLayer({
          id: "trail-line",
          type: "line",
          source: "trail",
          paint: {
            "line-color": "#111111",
            "line-width": 6,
            "line-opacity": 0.95,
          },
        });

        map.addSource("checkpoints", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: checkpoints.map((checkpoint) => ({
              type: "Feature" as const,
              geometry: {
                type: "Point" as const,
                coordinates: [checkpoint.lng, checkpoint.lat],
              },
              properties: {
                name: checkpoint.name,
                stage: checkpoint.stage,
              },
            })),
          },
        });

        map.addLayer({
          id: "checkpoint-points",
          type: "circle",
          source: "checkpoints",
          paint: {
            "circle-radius": 7,
            "circle-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#111111",
          },
        });

        const startPoint: [number, number] = latestPosition
          ? [latestPosition.lon, latestPosition.lat]
          : [route.mapCenter.lng, route.mapCenter.lat];

        markerRef.current = new mapboxgl.Marker({ color: "#111111", scale: 1.1 }).setLngLat(startPoint).addTo(map);

        if (!bounds.isEmpty()) {
          map.fitBounds(bounds, { padding: 56, duration: 0 });
        }
      });
    }

    void start();

    return () => {
      cancelled = true;
      markerRef.current?.remove();
      markerRef.current = null;
      instanceRef.current?.remove();
      instanceRef.current = null;
      followRef.current = true;
    };
  }, [checkpoints, latestPosition, mapboxToken, route.mapCenter.lat, route.mapCenter.lng, route.mapCenter.zoom, routeFeature]);

  useEffect(() => {
    if (!instanceRef.current) {
      return;
    }

    const trail = instanceRef.current.getSource("trail") as GeoJSONSource | undefined;
    trail?.setData(buildTrailFeature(positions));

    if (!latestPosition) {
      return;
    }

    markerRef.current?.setLngLat([latestPosition.lon, latestPosition.lat]);

    if (followRef.current) {
      instanceRef.current.easeTo({
        center: [latestPosition.lon, latestPosition.lat],
        duration: 900,
        zoom: Math.max(instanceRef.current.getZoom(), route.mapCenter.zoom),
      });
    }
  }, [latestPosition, positions, route.mapCenter.zoom]);

  if (!mapboxToken) {
    return (
      <div className="flex min-h-[34rem] flex-col justify-between rounded-[1.85rem] bg-[linear-gradient(165deg,#0f0f0f,#2a2a2a)] p-8 text-white">
        <div>
          <p className="text-sm uppercase tracking-[0.24em] text-white/60">Mapbox not configured</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-medium tracking-tight">
            The route is ready, but the branded live map needs `NEXT_PUBLIC_MAPBOX_TOKEN`.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
            The tracker still supports manual ride updates now, and the Overland-powered position stream will light up as soon as the public token is added.
          </p>
        </div>
        <div className="grid gap-3 md:grid-cols-4">
          {checkpoints.map((checkpoint) => (
            <div key={checkpoint.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
              <p className="text-xs uppercase tracking-[0.18em] text-white/55">{checkpoint.stage}</p>
              <p className="mt-2 text-lg font-medium">{checkpoint.name}</p>
              <p className="mt-2 text-sm text-white/65">{checkpoint.distance}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="relative overflow-hidden rounded-[1.85rem] bg-background">
      <div ref={mapRef} className="min-h-[34rem] w-full bg-[linear-gradient(135deg,#f7f7f7,#ececec)] md:min-h-[42rem]" />
      <div className="pointer-events-none absolute left-4 top-4 flex flex-wrap gap-3">
        <Pill label="State" value={state.replace("_", " ")} />
        <Pill label="Positions" value={String(positions.length)} />
        <Pill label="Camera" value={followEnabled ? "Follow" : "Free pan"} />
      </div>
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
            });
          }}
          className="absolute bottom-4 right-4 rounded-full border border-border bg-white px-4 py-2 text-sm font-medium text-foreground shadow-sm transition hover:border-foreground"
        >
          Recenter rider
        </button>
      ) : null}
    </div>
  );
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

function Pill({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground shadow-sm">
      {label}: {value}
    </div>
  );
}
