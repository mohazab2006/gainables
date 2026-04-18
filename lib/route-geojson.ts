import "server-only";

import { readFile } from "node:fs/promises";
import path from "node:path";

type LineStringFeature = {
  type: "Feature";
  properties?: Record<string, unknown>;
  geometry: {
    type: "LineString";
    coordinates: [number, number][];
  };
};

type FeatureCollection = {
  type: "FeatureCollection";
  features: LineStringFeature[];
};

export async function getRouteGeoJson() {
  const routePath = path.join(process.cwd(), "public", "route", "ottawa-montreal.geojson");
  const raw = await readFile(routePath, "utf8");
  const parsed = JSON.parse(raw) as FeatureCollection;
  const feature = parsed.features.find((item) => item.geometry.type === "LineString");

  if (!feature) {
    throw new Error("Route geojson must include a LineString feature.");
  }

  return feature;
}
