# Overland Rider Setup & Sync Guide

A single, self-contained doc for wiring the lead rider's iPhone to our live tracker using the [Overland GPS Tracker](https://overland.p3k.app/) iOS app. It covers server setup, on-device configuration, end-to-end testing, ride-day operations, edge cases, and recovery.

---

## 1. How the pipeline works

```
┌─────────────┐   HTTPS POST      ┌──────────────────────────┐   INSERT     ┌────────────────┐
│  Overland   │ ───────────────▶  │  Supabase Edge Function  │ ──────────▶  │ ride_positions │
│   on iOS    │   every 30 s      │     ingest-position      │              │      (db)      │
└─────────────┘                   └──────────────────────────┘              └────────┬───────┘
                                             ▲                                       │ realtime
                                             │ Authorization:                        ▼
                                             │ Bearer <RIDER_TOKEN>          ┌──────────────────┐
                                             │                               │  /track page +   │
                                             │                               │  biker-timeline  │
                                             │                               └──────────────────┘
```

- **Overland** posts a JSON batch of `{ locations: [...] }` every `Send Interval` seconds (default `30s`).
- The **`ingest-position`** Edge Function (`supabase/functions/ingest-position/index.ts`) checks `Authorization: Bearer <RIDER_TOKEN>`, maps each GeoJSON point to a row, and inserts into `public.ride_positions`.
- `ride_positions` is part of the `supabase_realtime` publication (see `supabase/migrations/0001_init.sql`), so the `/track` page receives new rows over a realtime channel and repaints the map and biker timeline instantly.
- Only **reads** are public; writes require the service-role key held by the Edge Function.

---

## 2. Environment checklist

All five of these must be present before the sync works. Audit them at `/admin` — the "Ride-day readiness at a glance" card flips each to green as it's satisfied.

| Variable | Where it lives | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | Base URL of the Supabase project. Used to build the ingest URL and open realtime channels. |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | `.env.local` + Vercel | Lets the public site read `ride_positions` / `ride_updates`. |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` + Vercel **and** Supabase Function secret | Lets the Edge Function bypass RLS to INSERT into `ride_positions`. |
| `RIDER_TOKEN` | `.env.local` + Vercel **and** Supabase Function secret | Shared secret used to authenticate Overland → function. Any long random string. |
| `NEXT_PUBLIC_MAPBOX_TOKEN` | `.env.local` + Vercel | Renders the branded map on `/track`. Without it the tracker falls back to a styled panel (ingest still works). |

Generate a rider token on Windows PowerShell:

```powershell
[System.Convert]::ToBase64String((1..48 | ForEach-Object { Get-Random -Maximum 256 }))
```

Or on macOS/Linux: `openssl rand -base64 48`.

Paste the same value into:

1. `.env.local` → `RIDER_TOKEN=...`
2. The Supabase Function secret store (see §3).
3. The Vercel project's environment variables (Production + Preview).

Restart `pnpm dev` after changing `.env.local` so Next picks up the new value.

---

## 3. One-time server setup

Prerequisites: Supabase CLI installed and logged in.

```powershell
# Windows (one-time)
npm i -g supabase       # or: scoop install supabase
supabase login
```

From the repo root:

```powershell
# 1. Link this repo to the Supabase project
supabase link --project-ref <project-ref>      # e.g. npljmelaepdrovwckewh

# 2. Push the schema (creates ride_positions, RLS policies, realtime publication)
supabase db push

# 3. Upload Edge Function secrets (these live ONLY on Supabase, not in your repo)
supabase secrets set RIDER_TOKEN=<same-value-as-.env.local>
# SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are auto-injected into functions,
# so you don't need to set them manually.

# 4. Deploy the Edge Function
supabase functions deploy ingest-position

# 5. Verify it's live (should return 401 unauthorized — that's correct, the token is missing)
curl -i -X POST https://<project-ref>.supabase.co/functions/v1/ingest-position -d "{}"
```

**What each response means:**

| Status | Meaning |
| --- | --- |
| `401 unauthorized` | Function is deployed and reachable. Correct response for an unauthenticated probe. |
| `404 NOT_FOUND` | Function was never deployed (re-run step 4). |
| `405 method_not_allowed` | You used GET. The function only accepts POST. |
| `500` + error body | Usually means the `ride_positions` table doesn't exist (re-run step 2). |

---

## 4. Grab the rider's deep link

Once `NEXT_PUBLIC_SUPABASE_URL` and `RIDER_TOKEN` are both set, the `/admin` dashboard renders the final deep link in the **"Send this to the lead rider when secrets are live."** card:

```
overland://setup?url=https%3A%2F%2F<project>.supabase.co%2Ffunctions%2Fv1%2Fingest-position&token=<RIDER_TOKEN>&device_id=lead-rider&unique_id=yes
```

Generated by `getOverlandSetupLink()` in `lib/env.ts`. Copy the textarea contents and send via iMessage, email, or AirDrop — whatever opens cleanly on the rider's iPhone. **Do not post it in a public channel**; it contains the live token.

---

## 5. Rider device setup (do this the day before)

Total time: ~10 minutes.

### 5.1 Install and seed the app

1. Install **Overland GPS Tracker** from the App Store on the lead rider's iPhone.
2. Open the phone's Messages / email app, tap the `overland://setup?...` link. iOS hands it to Overland, which autofills:
   - **Receiver Endpoint**: our ingest URL
   - **Access Token**: `RIDER_TOKEN`
   - **Device ID**: `lead-rider`
   - **Include Device ID**: `Yes`
3. When iOS asks, grant:
   - **Location**: **Always** (critical — "While Using" will stop when the screen locks)
   - **Motion & Fitness**: Allow
   - **Notifications**: Allow (Overland surfaces errors via banners)

### 5.2 Lock in the recommended settings

In Overland's main settings screen, confirm:

| Setting | Value | Why |
| --- | --- | --- |
| Tracking Enabled | **On** | Master switch. |
| Activity Type | **Fitness** | Most accurate profile for bike pace. |
| Desired Accuracy | **Best** | Cross-country route needs precision. |
| Distance Filter | **-1** (default) | Time-based sending, not distance-gated. |
| Deferred Locations | **Off** | Send promptly; iOS batches anyway when offline. |
| Send Interval | **30 seconds** | Good balance of battery and map freshness. |
| Pause Automatically | **Off** | We don't want iOS to pause at red lights. |
| Resume On Enter Region | **Off** | Not needed. |
| Discard Points | **Keep default** | |
| Logging Mode | **Only Latest** | Don't grow an unbounded local queue. |
| Significant Location Only | **Off** | Needed for continuous bike tracking. |
| Include Device ID | **Yes** | Already set by the deep link. |

### 5.3 iOS-level tweaks

- **Settings → General → Background App Refresh** → **On**, and Overland → **On**.
- **Settings → Overland → Cellular Data** → **On**.
- **Settings → Battery → Low Power Mode** → **Off** before rollout. Low Power Mode throttles background GPS.
- Disable Focus modes that silence Overland (check Focus filters too).

---

## 6. Test plan

Run these before handoff. The table below is the quick-scan version; detailed steps follow. Every `TC-*` is idempotent — re-run any of them any time.

| ID | Test | Purpose | Pass criteria |
| --- | --- | --- | --- |
| **TC-01** | Function reachable | Edge Function is deployed | `POST` with no auth → HTTP **401** `{"error":"unauthorized"}` |
| **TC-02** | Method guard | Only POST is accepted | `GET` → HTTP **405** `{"error":"method_not_allowed"}` |
| **TC-03** | Bad JSON rejected | Malformed body returns a clean error | `POST` with body `not-json` → HTTP **400** `{"error":"invalid_json"}` |
| **TC-04** | Empty batch is a no-op | `{}` and `{"locations":[]}` are safe | HTTP **200** `{"result":"ok"}`, no new DB rows |
| **TC-05** | Valid synthetic point | Token + payload actually inserts | HTTP **200**, new row in `ride_positions` with `source='overland'` |
| **TC-06** | Non-Point geometry is filtered | Linestrings/polygons shouldn't insert | HTTP **200**, **zero** new rows |
| **TC-07** | Battery normalization | 0–1 becomes 0–100 | `battery_level: 0.82` → `battery_pct = 82` |
| **TC-08** | Timestamp fallback | Missing timestamp doesn't crash | Row inserted, `recorded_at ≈ now()` |
| **TC-09** | Realtime propagation | `/track` repaints without refresh | Marker moves within ~2 s of insert |
| **TC-10** | Signal-age UI states | `deriveSignalStatus` transitions correctly | Badge flips Live → Delayed → Stale at the right ages |
| **TC-11** | Tracker state machine | Auto-promotes to `live` on first point | `/track` leaves pre-ride when first row arrives |
| **TC-12** | Device configured | Overland app post succeeds | **Send Now** returns `200 OK` in the log |
| **TC-13** | End-to-end on-device | Phone → DB → UI | Row matches phone location; `/track` shows "Live signal" |
| **TC-14** | Background tracking | Works with screen locked | Points continue after 2 min locked |
| **TC-15** | Offline queue + flush | No-data gap recovers | Points backfill when cellular returns |
| **TC-16** | Token rotation | New token works, old one fails | Old token → 401, new token → 200 |
| **TC-17** | Admin readiness | `/admin` reflects config | Every readiness row is green |
| **TC-18** | Ride-mode override | Manual `live` / `finished` works | UI matches selection regardless of positions |

### 6.1 Setup: shared PowerShell variables

Run once per terminal session. Everything in §6.2–§6.5 assumes these are set.

```powershell
$base     = "https://<project-ref>.supabase.co/functions/v1/ingest-position"
$token    = "<RIDER_TOKEN>"
$now      = (Get-Date).ToUniversalTime().ToString("o")
$headers  = @{ Authorization = "Bearer $token" }
```

Helper to clean up synthetic rows (coordinates chosen so they're unmistakable — Parliament Hill, Ottawa):

```sql
-- run in Supabase SQL editor when you're done testing
delete from public.ride_positions
where (lat = 45.4215 and lon = -75.6972)
   or (lat = 45.4216 and lon = -75.6973)
   or (lat = 45.4217 and lon = -75.6974);
```

### 6.2 Function-level tests (no phone needed)

These hit the Edge Function directly and verify it behaves per `supabase/functions/ingest-position/index.ts`.

**TC-01 — Function reachable + auth gate**

```powershell
try { Invoke-WebRequest -Uri $base -Method POST -ContentType "application/json" -Body "{}" -ErrorAction Stop }
catch { "Status: $($_.Exception.Response.StatusCode.value__)" }
```

Expected: `Status: 401`. Anything else → function isn't deployed (404) or URL is wrong.

**TC-02 — Method guard**

```powershell
try { Invoke-WebRequest -Uri $base -Method GET -Headers $headers -ErrorAction Stop }
catch { "Status: $($_.Exception.Response.StatusCode.value__)" }
```

Expected: `Status: 405`.

**TC-03 — Bad JSON**

```powershell
try { Invoke-WebRequest -Uri $base -Method POST -Headers $headers -ContentType "application/json" -Body "not-json" -ErrorAction Stop }
catch { "Status: $($_.Exception.Response.StatusCode.value__)" }
```

Expected: `Status: 400`, body `{"error":"invalid_json"}`.

**TC-04 — Empty batch is a no-op**

```powershell
Invoke-RestMethod -Uri $base -Method POST -Headers $headers -ContentType "application/json" -Body '{"locations":[]}'
```

Expected: `{"result":"ok"}`. Run the "latest 5 rows" SQL from §6.3 before and after — count should be unchanged.

**TC-05 — Valid synthetic point** (this is the big one)

```powershell
$body = @{
  locations = @(@{
    type = "Feature"
    geometry = @{ type = "Point"; coordinates = @(-75.6972, 45.4215) }
    properties = @{ timestamp = $now; horizontal_accuracy = 8.0; speed = 6.1; battery_level = 0.82 }
  })
} | ConvertTo-Json -Depth 6
Invoke-RestMethod -Uri $base -Method POST -Headers $headers -ContentType "application/json" -Body $body
```

Expected: `{"result":"ok"}`. Then in Supabase SQL editor:

```sql
select recorded_at, lat, lon, source, accuracy_m, speed_mps, battery_pct
from public.ride_positions
where lat = 45.4215 and lon = -75.6972
order by recorded_at desc limit 1;
```

Pass criteria: exactly one fresh row; `source = 'overland'`, `battery_pct = 82` (see TC-07), `accuracy_m = 8.00`, `speed_mps = 6.100`.

**TC-06 — Non-Point geometry is filtered out**

```powershell
$body = @{
  locations = @(@{
    geometry = @{ type = "LineString"; coordinates = @(@(-75.70, 45.42), @(-75.69, 45.43)) }
    properties = @{ timestamp = $now }
  })
} | ConvertTo-Json -Depth 6
Invoke-RestMethod -Uri $base -Method POST -Headers $headers -ContentType "application/json" -Body $body
```

Expected: `{"result":"ok"}` **and no row inserted**. The function explicitly skips any `geometry.type !== "Point"`.

**TC-07 — Battery normalization** (covered by TC-05): `battery_level: 0.82` on input, `battery_pct = 82` in DB. Re-send with `battery_level: 87` (integer) and confirm it stays `87` (function only scales values ≤ 1).

**TC-08 — Missing timestamp falls back to now**

```powershell
$body = @{
  locations = @(@{
    geometry = @{ type = "Point"; coordinates = @(-75.6973, 45.4216) }
    properties = @{ horizontal_accuracy = 12.0 }
  })
} | ConvertTo-Json -Depth 6
Invoke-RestMethod -Uri $base -Method POST -Headers $headers -ContentType "application/json" -Body $body
```

Then:

```sql
select recorded_at, now() - recorded_at as age
from public.ride_positions
where lat = 45.4216 and lon = -75.6973
order by recorded_at desc limit 1;
```

Pass criteria: `age` is under a minute.

### 6.3 Propagation & UI tests

**TC-09 — Realtime propagation**

1. Open `/track` in one browser tab — leave it alone, do **not** refresh.
2. Open DevTools → Network → WS. You should see a Supabase realtime WebSocket with subscriptions active.
3. Run TC-05 again (new synthetic point at a slightly different coordinate, e.g. `-75.6974, 45.4217`).
4. Within ~2 seconds, the `/track` map marker and biker-timeline should shift to the new coordinate **without a page refresh**.

If the map doesn't update:
- Verify the realtime publication includes the table:

```sql
select pubname, schemaname, tablename
from pg_publication_tables
where pubname = 'supabase_realtime' and tablename in ('ride_positions', 'ride_updates');
```

- Check that `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` is set in the deployed Vercel env (otherwise the client can't subscribe).

**TC-10 — Signal-age UI states**

Per `deriveSignalStatus` in `lib/track.ts`: ≤3 min → **Live**, ≤15 min → **Delayed**, else → **Stale**.

To test without waiting, backdate synthetic rows:

```sql
-- Live (badge should read "Live signal")
insert into public.ride_positions (recorded_at, lat, lon, source)
values (now() - interval '1 minute', 45.4215, -75.6972, 'overland');

-- Delayed (badge should read "Delayed signal")
insert into public.ride_positions (recorded_at, lat, lon, source)
values (now() - interval '8 minutes', 45.4216, -75.6973, 'overland');

-- Stale (badge should read "Signal stale")
insert into public.ride_positions (recorded_at, lat, lon, source)
values (now() - interval '30 minutes', 45.4217, -75.6974, 'overland');
```

Hard-refresh `/track` after each insert; the signal badge should match.

**TC-11 — Tracker state machine**

1. Empty `ride_positions` (or ensure no recent rows).
2. `/admin` → Ride mode = `auto`.
3. `/track` should show the pre-ride state.
4. Insert one synthetic point (TC-05).
5. `/track` should auto-promote to "live" within a couple of seconds (see `deriveTrackerState` in `lib/track.ts`).

**TC-18 — Ride-mode override**

- `/admin` → Ride mode = `live` → `/track` enters live mode even with an empty `ride_positions` table.
- `/admin` → Ride mode = `finished` → `/track` shows the finished state even with fresh positions.
- Return to `auto` for normal operation.

### 6.4 Device tests (phone in hand)

**TC-12 — Device configured** (see §5): the `overland://setup?...` deep link opens Overland and prefills URL, token, device ID.

**TC-13 — End-to-end from phone**

1. On the rider's phone, open Overland and tap **Send Now**.
2. In the response log, expect `HTTP 200` with `{"result":"ok"}`.
3. In Supabase SQL editor:

```sql
select recorded_at, lat, lon, accuracy_m, speed_mps, battery_pct
from public.ride_positions
where source = 'overland'
order by recorded_at desc limit 1;
```

The row's `lat`/`lon` should match the phone's actual location (cross-check with Apple Maps).

4. Open `/track` on a separate device. Within 2 seconds of step 3, the biker-timeline marker should render at the rider's location and the badge should read **Live signal**.

**TC-14 — Background tracking**

1. Tap **Start Tracking** in Overland.
2. Lock the phone; put it in a pocket or bag.
3. Have the rider walk for 2 minutes.
4. Unlock, open Overland; the log should show multiple successful sends while locked.
5. `/track` should show a short trail of points — not a single frozen marker.

If points stop while locked: Background App Refresh is off, Low Power Mode is on, or location permission is set to "While Using" instead of "Always". Fix per §5.3.

**TC-15 — Offline queue + flush**

1. Enable Airplane Mode on the phone (keeps GPS running but kills cellular/Wi-Fi).
2. Walk 200 m (or just wait 2–3 minutes).
3. `/track` should freeze (correctly — no new data).
4. Disable Airplane Mode.
5. Within a few seconds, Overland flushes its queue. `/track` should receive a burst of points and the trail should fill in retroactively (points are ordered by `recorded_at`, not insert time).

### 6.5 Security & operational tests

**TC-16 — Token rotation**

1. Generate a new token value, e.g. `oldToken = $token`, `newToken = "..."`.
2. `supabase secrets set RIDER_TOKEN=<newToken>` and `supabase functions deploy ingest-position`.
3. Replay TC-05 with the old token → expect **401**.
4. Replay TC-05 with the new token → expect **200**.
5. Update `.env.local` and Vercel env to match, re-generate the Overland deep link from `/admin`, and re-open it on the phone.

**TC-17 — Admin readiness dashboard**

Open `/admin` and confirm every row on the "Ride-day readiness at a glance" card is green:

- Public Supabase client
- Admin and Edge Function credentials
- Mapbox public token
- Overland rider token
- Canonical site URL

If any is red, follow the detail text — these map 1:1 to the env vars in §2.

### 6.6 Cleanup

After testing, remove synthetic rows:

```sql
delete from public.ride_positions
where (lat between 45.4214 and 45.4218)
  and (lon between -75.6975 and -75.6971);
```

And in Overland, tap **Stop Tracking** so the phone isn't streaming location until ride day.

---

## 7. Ride-day operations

### 7.1 Rollout

1. Phone is fully charged; battery bank connected via cable (not wireless — wireless throttles charging on iPhone during high GPS load).
2. **Disable Low Power Mode**.
3. Open Overland, confirm **Tracking: ON**.
4. Tap **Start Tracking** the moment the rider crosses the start line.
5. Lock the phone and stash it in a handlebar bag / jersey pocket with a clear view of the sky when possible.

### 7.2 Monitoring (from HQ)

- Keep `/track` open on one tab — watch for the marker advancing every ~30 seconds.
- Keep `/admin/updates` open on another — use it to post narrative updates (photos, checkpoints) that supplement raw GPS.
- The biker-timeline will advance past checkpoints automatically as `ride_positions` rows come in; no manual work needed for the map itself.

### 7.3 Post-ride

1. Rider taps **Stop Tracking** after crossing the finish.
2. Rider taps **Send Now** once to flush any buffered points.
3. Operator sets `/admin` → **Ride mode** → `finished`.
4. Publish a final `/admin/updates` entry with the finish time and total.
5. `/track` should render the completed state with the full trail preserved.

See `docs/ride-day-runbook.md` for the broader ride-day checklist (subscribers export, etc.).

---

## 8. Edge cases & troubleshooting

### 8.1 Signal / delivery issues

| Symptom | Likely cause | Fix |
| --- | --- | --- |
| `/track` map isn't updating | Overland paused by iOS (Low Power / Background Refresh off) | On device: Low Power Mode → Off, Background App Refresh → On. Tap **Send Now** to prove recovery. |
| Overland log shows `401 unauthorized` | Token mismatch between device and function | Re-open the deep link (§4). If still 401, run `supabase secrets list` and compare to `.env.local`. |
| Overland log shows `404 NOT_FOUND` | Function not deployed or wrong project ref in URL | `supabase functions deploy ingest-position`; double-check the URL in Overland matches `NEXT_PUBLIC_SUPABASE_URL`. |
| Overland log shows `500` | `ride_positions` missing or schema drift | Re-run `supabase db push`. Inspect logs: `supabase functions logs ingest-position --project-ref <ref>`. |
| Overland log shows `invalid_json` | Body was empty or malformed (very rare from the app) | Usually transient — next batch will succeed. If persistent, update Overland from the App Store. |
| Map updates, then freezes for >3 min | Dead zone / no cellular | Expected. Overland queues and flushes when service returns. Meanwhile, `/track` shows "Delayed signal", then "Signal stale" past 15 min. Post manual updates from `/admin/updates`. |
| Points arrive in a burst after a gap | iOS batched during cellular outage | Normal and non-destructive. Timeline catches up automatically. |
| Points arrive but `/track` doesn't repaint | Realtime channel isn't subscribed / publication missing | Re-check the `pg_publication_tables` query in §6.3. Hard-refresh the page. |

### 8.2 Accuracy & battery

- **Battery drain** is ~15–25%/hour with Best accuracy + 30s interval. A 20,000 mAh brick covers a full riding day with margin.
- If battery becomes critical mid-ride: change Send Interval to `60s` in Overland (still plenty granular for a cross-country ride), keep Accuracy at Best.
- **Horizontal accuracy spikes** (>100 m, shown in the `accuracy_m` column) happen in tunnels / dense downtown cores. The trail will look jittery for a few points and settle — no action needed. If you want to clean up, delete outlier rows:

```sql
delete from public.ride_positions
where recorded_at > now() - interval '1 hour'
  and accuracy_m > 100;
```

### 8.3 Operational safety nets

- **Rider's phone dies** → retrieve battery bank → on reboot, Overland auto-resumes tracking because "Tracking Enabled" is persisted. The rider does **not** need the deep link again (token is saved).
- **RIDER_TOKEN leaks / needs rotation mid-ride** → generate a new token, `supabase secrets set RIDER_TOKEN=<new>`, redeploy the function, then re-send the deep link to the rider. All queued points on the device will fail `401` until they reconfigure — so only rotate if truly necessary.
- **Function cold-start latency** → first POST after a long idle can take 1–2 s. Overland retries automatically.
- **Schema change to `ride_positions`** → keep the insert column list in `supabase/functions/ingest-position/index.ts` in sync. Deploy migrations *before* redeploying the function.

### 8.4 Privacy

- The raw Overland payload is stored verbatim in `ride_positions.raw` (jsonb). It includes device metadata (battery, activity, wifi SSID in some versions). If we want to publish the trail post-ride, consider stripping `raw` for the public export.
- Only `lat`/`lon`/timestamp are read by the public site; `raw` is operator-only via admin/service-role access.

---

## 9. Quick reference

**Ingest URL**

```
https://<project-ref>.supabase.co/functions/v1/ingest-position
```

**Auth header**

```
Authorization: Bearer <RIDER_TOKEN>
```

**Expected payload (abridged)**

```json
{
  "locations": [
    {
      "type": "Feature",
      "geometry": { "type": "Point", "coordinates": [-75.6972, 45.4215] },
      "properties": {
        "timestamp": "2026-04-21T15:00:00Z",
        "horizontal_accuracy": 8.0,
        "speed": 6.1,
        "battery_level": 0.82
      }
    }
  ]
}
```

**Useful commands**

```powershell
# Tail function logs
supabase functions logs ingest-position --project-ref <ref>

# Check what secrets are set on the function
supabase secrets list

# Re-deploy after a code change
supabase functions deploy ingest-position
```

**Files to know**

- `supabase/functions/ingest-position/index.ts` — the Edge Function.
- `supabase/migrations/0001_init.sql` — `ride_positions` schema + RLS + realtime publication.
- `lib/env.ts` — `getOverlandSetupLink`, readiness checks.
- `lib/track.ts` — signal status logic (`deriveSignalStatus`).
- `components/track/tracker-shell.tsx` — renders `/track` with the live data.
- `app/admin/page.tsx` — rider setup link card + readiness panel.
