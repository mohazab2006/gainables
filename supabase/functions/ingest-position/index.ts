// @ts-nocheck
import { createClient } from "npm:@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
const riderToken = Deno.env.get("RIDER_TOKEN") ?? "";

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { autoRefreshToken: false, persistSession: false },
});

type OverlandPayload = {
  locations?: Array<{
    geometry?: {
      type?: string;
      coordinates?: [number, number];
    };
    properties?: {
      timestamp?: string;
      horizontal_accuracy?: number;
      speed?: number;
      battery_level?: number;
    } & Record<string, unknown>;
  }>;
};

Deno.serve(async (request) => {
  if (request.method !== "POST") {
    return json({ error: "method_not_allowed" }, 405);
  }

  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${riderToken}`) {
    return json({ error: "unauthorized" }, 401);
  }

  let payload: OverlandPayload;
  try {
    payload = (await request.json()) as OverlandPayload;
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const locations = payload.locations ?? [];
  if (!locations.length) {
    return json({ result: "ok" });
  }

  const rows = locations
    .map((location) => {
      const coordinates = location.geometry?.coordinates;
      if (location.geometry?.type !== "Point" || !coordinates || coordinates.length < 2) {
        return null;
      }

      const [lon, lat] = coordinates;
      return {
        recorded_at: location.properties?.timestamp ?? new Date().toISOString(),
        lon,
        lat,
        accuracy_m: toNullableNumber(location.properties?.horizontal_accuracy),
        speed_mps: toNullableNumber(location.properties?.speed),
        battery_pct: toNullableBattery(location.properties?.battery_level),
        source: "overland",
        raw: location,
      };
    })
    .filter((row) => row !== null);

  if (!rows.length) {
    return json({ result: "ok" });
  }

  const { error } = await supabase.from("ride_positions").insert(rows);
  if (error) {
    return json({ error: error.message }, 500);
  }

  return json({ result: "ok" });
});

function toNullableNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
}

function toNullableBattery(value: unknown) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) {
    return null;
  }

  return parsed <= 1 ? parsed * 100 : parsed;
}

function json(body: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      "content-type": "application/json",
    },
  });
}
