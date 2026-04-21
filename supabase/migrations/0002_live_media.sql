alter table public.ride_updates
  add column if not exists media_url text,
  add column if not exists media_kind text check (media_kind in ('image', 'video')),
  add column if not exists media_alt text;
