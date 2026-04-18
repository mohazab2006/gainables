# Overland Rider Setup

Use this on ride day for the lead rider.

1. Install Overland GPS Tracker on the rider's iPhone.
2. Open the deep link below on the device:

```text
overland://setup?url=https%3A%2F%2F<project>.supabase.co%2Ffunctions%2Fv1%2Fingest-position&token=<RIDER_TOKEN>&device_id=lead-rider&unique_id=yes
```

3. In Overland, confirm these settings:
   - `Activity Type`: `Fitness`
   - `Desired Accuracy`: `Best`
   - `Send Interval`: `30s`
   - `Logging Mode`: `Only Latest`
   - `Pause Automatically`: `Off`
4. Grant `Always` location access.
5. Disable Low Power Mode before the ride.
6. Tap `Start Tracking` when the rollout begins.
7. Tap `Stop Tracking` after the finish in Montreal.

The ingest endpoint expects:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `RIDER_TOKEN`

Deploy the function with:

```bash
supabase functions deploy ingest-position
```
