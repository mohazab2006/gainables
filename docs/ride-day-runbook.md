# Ride-Day Runbook

## Preflight

1. Confirm `.env.local` and production envs match the values in `.env.example`.
2. Confirm `/admin` shows all tracker readiness items as `Ready`.
3. Confirm the Edge Function is deployed:

```bash
supabase functions deploy ingest-position
```

4. Confirm the rider token secret is present:

```bash
supabase secrets list
```

5. Confirm `/track` renders the Mapbox map and not the fallback-only panel.

## Rider onboarding

1. Generate the Overland deep link using the production Supabase project URL and the current `RIDER_TOKEN`.
2. Send the link to the lead rider the day before the event.
3. Have the rider open the link on their iPhone and verify Overland saves the endpoint configuration.
4. Confirm these Overland settings:
   - `Activity Type = Fitness`
   - `Desired Accuracy = Best`
   - `Send Interval = 30s`
   - `Logging Mode = Only Latest`
5. Confirm `Always` location access and disable Low Power Mode.

## Start-of-day checks

1. Open `/track` and `/admin/updates`.
2. Ask the rider to start tracking in Overland.
3. Wait for the first `ride_positions` row to arrive.
4. Confirm `/track` switches into live telemetry with a moving rider marker and a fresh signal badge.

## If signal drops

1. Keep the tracker page public; it still shows the route and last received trail.
2. Post manual updates from `/admin/updates` with location, checkpoint, and message.
3. Continue manual posting until the Overland feed resumes and queued points flush.

## Post-ride

1. Set `tracker_status` to `finished` in `/admin/content`.
2. Publish a final update with the finish message.
3. Confirm `/track` shows the completed state and preserved trail.
