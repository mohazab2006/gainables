# Ride for Mental Health

Next.js 16.2.4 campaign site for Gainables' Ottawa to Montreal Ride for Mental Health. The site is backed by Supabase for editable content, sponsor records, FAQs, subscribers, ride updates, and live rider positions coming from an Overland-powered Edge Function.

## Stack

- Next.js 16.2.4 App Router
- React 19
- Tailwind CSS v4
- Supabase SSR + Supabase Realtime
- Mapbox GL JS
- Supabase Edge Functions for GPS ingestion

## Local setup

1. Copy `.env.example` to `.env.local`.
2. Fill in the Supabase URL, publishable key, and service role key.
3. Set `ADMIN_ALLOWED_EMAILS` to the comma-separated admin allowlist.
4. Add `NEXT_PUBLIC_MAPBOX_TOKEN` if you want the branded live map instead of the fallback tracker panel.
5. Add `RIDER_TOKEN` before generating the Overland setup link for the lead rider.
6. Optionally add `RESEND_API_KEY` and `RESEND_FROM_EMAIL` to send signup confirmations.
7. Run `pnpm install`.
8. Run `pnpm dev`.

## Required environment variables

- `NEXT_PUBLIC_SITE_URL`: canonical site URL used by metadata and auth callbacks.
- `NEXT_PUBLIC_SUPABASE_URL`: Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`: browser-safe publishable key for public reads and realtime.
- `SUPABASE_SERVICE_ROLE_KEY`: required for admin writes and Edge Function ingestion.
- `NEXT_PUBLIC_MAPBOX_TOKEN`: public token for the `/track` map.
- `ADMIN_ALLOWED_EMAILS`: comma-separated allowlist for admin access.
- `RIDER_TOKEN`: bearer token validated by `supabase/functions/ingest-position`.
- `RESEND_API_KEY`: optional API key for signup confirmation emails.
- `RESEND_FROM_EMAIL`: optional sender for Resend email delivery. Defaults to `onboarding@resend.dev`.

## Database and functions

- Run the schema in [supabase/migrations/0001_init.sql](./supabase/migrations/0001_init.sql).
- Deploy the ingest function:

```bash
supabase functions deploy ingest-position
```

- Set the Edge Function secrets:

```bash
supabase secrets set \
  SUPABASE_URL=... \
  SUPABASE_SERVICE_ROLE_KEY=... \
  RIDER_TOKEN=...
```

## Ride-day operations

- Overland setup and rider link format: [docs/overland-setup.md](./docs/overland-setup.md)
- Deployment and support workflow: [docs/ride-day-runbook.md](./docs/ride-day-runbook.md)
- Subscriber export and follow-up: use `/admin/subscribers`

## Useful commands

```bash
pnpm dev
pnpm build
pnpm exec tsc --noEmit
```
