"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap, Marker } from "mapbox-gl";

import type { RideUpdate, RouteContent } from "@/lib/fallback-content";

type LiveMapProps = {
  mapboxToken?: string;
  route: RouteContent;
  trackerEmbedUrl?: string | null;
  update: RideUpdate;
};

export function LiveMap({ mapboxToken, route, trackerEmbedUrl, update }: LiveMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const instanceRef = useRef<MapboxMap | null>(null);
  const markerRef = useRef<Marker | null>(null);

  useEffect(() => {
    if (!mapboxToken || !mapRef.current) return;

    let cancelled = false;

    async function start() {
      const mapboxgl = await import("mapbox-gl");
      mapboxgl.default.accessToken = mapboxToken;

      const bounds = new mapboxgl.LngLatBounds();
      route.polyline.forEach((point) => bounds.extend([point.lng, point.lat]));

      const map = new mapboxgl.default.Map({
        container: mapRef.current!,
        style: "mapbox://styles/mapbox/light-v11",
        center: [route.mapCenter.lng, route.mapCenter.lat],
        zoom: route.mapCenter.zoom,
      });

      instanceRef.current = map;

      map.on("load", () => {
        if (cancelled) return;

        map.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: {
              type: "LineString",
              coordinates: route.polyline.map((point) => [point.lng, point.lat]),
            },
            properties: {},
          },
        });

        map.addLayer({
          id: "route-line",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#111111",
            "line-width": 5,
            "line-opacity": 0.72,
          },
        });

        map.addSource("checkpoints", {
          type: "geojson",
          data: {
            type: "FeatureCollection",
            features: route.polyline.map((point, index) => ({
              type: "Feature" as const,
              geometry: {
                type: "Point" as const,
                coordinates: [point.lng, point.lat],
              },
              properties: {
                label: route.checkpoints[index]?.name ?? `Checkpoint ${index + 1}`,
              },
            })),
          },
        });

        map.addLayer({
          id: "checkpoint-points",
          type: "circle",
          source: "checkpoints",
          paint: {
            "circle-radius": 6,
            "circle-color": "#ffffff",
            "circle-stroke-width": 2,
            "circle-stroke-color": "#111111",
          },
        });

        markerRef.current = new mapboxgl.Marker({ color: "#111111", scale: 1.1 })
          .setLngLat([update.lng, update.lat])
          .addTo(map);

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
    };
  }, [mapboxToken, route]);

  useEffect(() => {
    if (!instanceRef.current) {
      return;
    }

    markerRef.current?.setLngLat([update.lng, update.lat]);
    instanceRef.current.easeTo({
      center: [update.lng, update.lat],
      duration: 1200,
      zoom: Math.max(instanceRef.current.getZoom(), route.mapCenter.zoom),
    });
  }, [route.mapCenter.zoom, update.lat, update.lng]);

  if (trackerEmbedUrl) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-border bg-secondary/50 p-4">
        <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-background">
          <iframe title="Live tracker" src={trackerEmbedUrl} className="h-full w-full border-0" loading="lazy" />
        </div>
      </div>
    );
  }

  if (!mapboxToken) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-border bg-secondary/50 p-4">
        <div className="flex aspect-[4/3] flex-col justify-between rounded-[1.5rem] bg-[linear-gradient(160deg,#151515,#2a2a2a)] p-8 text-white">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-white/60">Tracker fallback</p>
            <h2 className="mt-4 max-w-xl text-3xl font-medium tracking-tight">
              Live checkpoint data is available even when the custom map isn&apos;t configured.
            </h2>
            <p className="mt-4 max-w-2xl text-sm leading-7 text-white/72">
              Add `NEXT_PUBLIC_MAPBOX_TOKEN` for the route map, or set `tracker_embed_url` to use a hosted GPS feed.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {route.checkpoints.map((checkpoint) => (
              <div key={checkpoint.name} className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-xs uppercase tracking-[0.18em] text-white/55">{checkpoint.stage}</p>
                <p className="mt-2 text-lg font-medium">{checkpoint.name}</p>
                <p className="mt-2 text-sm text-white/65">{checkpoint.distance}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-secondary/50 p-4">
      <div className="relative">
        <div ref={mapRef} className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#f7f7f7,#e8e8e8)]" />
        <div className="pointer-events-none absolute left-4 top-4 rounded-full border border-black/10 bg-white/90 px-4 py-2 text-xs uppercase tracking-[0.2em] text-foreground shadow-sm">
          Rider marker follows the latest manual update
        </div>
      </div>
    </div>
  );
}
