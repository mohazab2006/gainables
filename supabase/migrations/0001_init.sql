create extension if not exists "pgcrypto";
create extension if not exists "citext";

create table if not exists public.site_content (
  key text primary key,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  tier text not null check (tier in ('lead', 'supporting', 'community')),
  logo_url text,
  link text,
  sort_order integer not null default 0,
  visible boolean not null default true,
  tagline text,
  created_at timestamptz not null default now()
);

create table if not exists public.ride_updates (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  location text not null,
  km_completed numeric(6,2) not null default 0,
  next_checkpoint text not null,
  message text not null,
  lat numeric(9,6),
  lng numeric(9,6)
);

create table if not exists public.subscribers (
  id uuid primary key default gen_random_uuid(),
  email citext not null unique,
  source text,
  created_at timestamptz not null default now()
);

create table if not exists public.faqs (
  id uuid primary key default gen_random_uuid(),
  question text not null,
  answer text not null,
  sort_order integer not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);

alter table public.site_content enable row level security;
alter table public.sponsors enable row level security;
alter table public.ride_updates enable row level security;
alter table public.subscribers enable row level security;
alter table public.faqs enable row level security;

create policy "site_content_public_read"
on public.site_content
for select
to anon, authenticated
using (true);

create policy "sponsors_public_read"
on public.sponsors
for select
to anon, authenticated
using (visible = true);

create policy "ride_updates_public_read"
on public.ride_updates
for select
to anon, authenticated
using (true);

create policy "faqs_public_read"
on public.faqs
for select
to anon, authenticated
using (visible = true);

create policy "subscribers_anon_insert"
on public.subscribers
for insert
to anon, authenticated
with check (true);

insert into storage.buckets (id, name, public)
values ('sponsor-logos', 'sponsor-logos', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('campaign-media', 'campaign-media', true)
on conflict (id) do nothing;

create policy "sponsor_logos_public_read"
on storage.objects
for select
to public
using (bucket_id = 'sponsor-logos');

create policy "campaign_media_public_read"
on storage.objects
for select
to public
using (bucket_id = 'campaign-media');
