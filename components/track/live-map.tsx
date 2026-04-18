"use client";

import { useEffect, useRef } from "react";
import type { Map as MapboxMap } from "mapbox-gl";

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

  useEffect(() => {
    if (!mapboxToken || !mapRef.current) return;

    let cancelled = false;

    async function start() {
      const mapboxgl = (await import("mapbox-gl")).default;
      mapboxgl.accessToken = mapboxToken;

      const map = new mapboxgl.Map({
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
            "line-width": 4,
            "line-opacity": 0.7,
          },
        });

        new mapboxgl.Marker({ color: "#111111" })
          .setLngLat([update.lng, update.lat])
          .addTo(map);
      });
    }

    void start();

    return () => {
      cancelled = true;
      instanceRef.current?.remove();
      instanceRef.current = null;
    };
  }, [mapboxToken, route, update]);

  if (trackerEmbedUrl) {
    return (
      <div className="overflow-hidden rounded-[2rem] border border-border bg-secondary/50 p-4">
        <div className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-background">
          <iframe title="Live tracker" src={trackerEmbedUrl} className="h-full w-full border-0" loading="lazy" />
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-[2rem] border border-border bg-secondary/50 p-4">
      <div ref={mapRef} className="aspect-[4/3] overflow-hidden rounded-[1.5rem] bg-[linear-gradient(135deg,#f7f7f7,#e8e8e8)]" />
    </div>
  );
}
