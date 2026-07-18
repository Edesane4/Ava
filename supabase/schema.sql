-- ════════════════════════════════════════════════════════════════════════
-- PawPal Pet Care — Database schema
-- Run this in your Supabase project: Dashboard → SQL Editor → New query → Run
-- Safe to re-run (uses IF NOT EXISTS / CREATE OR REPLACE where possible).
-- ════════════════════════════════════════════════════════════════════════

-- Needed for gen_random_uuid()
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────────────────
-- ENUMS
-- ────────────────────────────────────────────────────────────────────────
do $$ begin
  create type user_role as enum ('customer', 'provider');
exception when duplicate_object then null; end $$;

do $$ begin
  create type booking_status as enum ('pending', 'confirmed', 'declined', 'completed', 'cancelled');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_status as enum ('unpaid', 'paid');
exception when duplicate_object then null; end $$;

do $$ begin
  create type payment_method as enum ('pay_now', 'cash', 'venmo', 'zelle', 'apple_cash');
exception when duplicate_object then null; end $$;

-- ────────────────────────────────────────────────────────────────────────
-- PROFILES  (1:1 with auth.users)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  email       text,
  full_name   text,
  avatar_url  text,
  phone       text,
  role        user_role not null default 'customer',
  created_at  timestamptz not null default now()
);

-- ────────────────────────────────────────────────────────────────────────
-- PETS
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.pets (
  id          uuid primary key default gen_random_uuid(),
  owner_id    uuid not null references public.profiles(id) on delete cascade,
  name        text not null,
  species     text not null default 'dog' check (species in ('dog', 'cat')),
  breed       text,
  photo_url   text,
  notes       text,
  created_at  timestamptz not null default now()
);
create index if not exists pets_owner_idx on public.pets(owner_id);

-- ────────────────────────────────────────────────────────────────────────
-- SERVICES  (the menu — seeded below, editable by provider)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.services (
  id              uuid primary key default gen_random_uuid(),
  slug            text unique not null,
  name            text not null,
  description     text,
  category        text not null,           -- 'walk' | 'home_care'
  duration_min    int,                     -- null for non-timed services
  price_cents     int not null,
  emoji           text default '🐾',
  active          boolean not null default true,
  sort_order      int not null default 0
);

-- ────────────────────────────────────────────────────────────────────────
-- BOOKINGS
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.bookings (
  id                   uuid primary key default gen_random_uuid(),
  customer_id          uuid not null references public.profiles(id) on delete cascade,
  pet_id               uuid references public.pets(id) on delete set null,
  service_id           uuid references public.services(id) on delete set null,

  -- Denormalized snapshots so history stays accurate even if a service/pet changes.
  service_name         text,
  pet_name             text,           -- combined label, e.g. "Biscuit & Luna"
  pet_ids              uuid[] default '{}',  -- all pets on this booking
  price_cents          int not null default 0,

  scheduled_at         timestamptz not null,
  duration_min         int,

  address              text,
  lat                  double precision,
  lng                  double precision,
  special_instructions text,

  status               booking_status not null default 'pending',
  payment_method       payment_method not null default 'cash',
  payment_status       payment_status not null default 'unpaid',

  created_at           timestamptz not null default now()
);
create index if not exists bookings_customer_idx  on public.bookings(customer_id);
create index if not exists bookings_scheduled_idx on public.bookings(scheduled_at);

-- ────────────────────────────────────────────────────────────────────────
-- NOTIFICATIONS  (provider's feed + customer updates)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  title       text not null,
  body        text,
  booking_id  uuid references public.bookings(id) on delete cascade,
  read        boolean not null default false,
  created_at  timestamptz not null default now()
);
create index if not exists notifications_user_idx on public.notifications(user_id, read);

-- ────────────────────────────────────────────────────────────────────────
-- PUSH SUBSCRIPTIONS  (Web Push — used by the notify Edge Function)
-- ────────────────────────────────────────────────────────────────────────
create table if not exists public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.profiles(id) on delete cascade,
  subscription jsonb not null,
  created_at  timestamptz not null default now(),
  unique (user_id, subscription)
);

-- ════════════════════════════════════════════════════════════════════════
-- AUTO-CREATE A PROFILE WHEN A USER SIGNS UP
-- Role = 'provider' if the email matches the configured provider email,
-- otherwise 'customer'. Set the provider email below to YOUR email.
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  provider_email text := 'edesane4@gmail.com'; -- 👈 the provider account (change if needed)
begin
  insert into public.profiles (id, email, full_name, avatar_url, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', split_part(new.email, '@', 1)),
    new.raw_user_meta_data->>'avatar_url',
    case when lower(new.email) = lower(provider_email) then 'provider'::user_role
         else 'customer'::user_role end
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ════════════════════════════════════════════════════════════════════════
-- NOTIFY THE PROVIDER WHEN A NEW BOOKING IS CREATED
-- Inserts a row into notifications for every provider. A Supabase Database
-- Webhook (or the Edge Function) can listen and fire a push/Google Calendar.
-- ════════════════════════════════════════════════════════════════════════
create or replace function public.handle_new_booking()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.notifications (user_id, title, body, booking_id)
  select p.id,
         '🎉 New client!',
         coalesce(new.pet_name, 'A pet') || ' • ' ||
           to_char(new.scheduled_at, 'Mon DD at HH12:MI AM'),
         new.id
  from public.profiles p
  where p.role = 'provider';
  return new;
end;
$$;

drop trigger if exists on_booking_created on public.bookings;
create trigger on_booking_created
  after insert on public.bookings
  for each row execute function public.handle_new_booking();

-- ════════════════════════════════════════════════════════════════════════
-- GRANTS
-- RLS controls WHICH ROWS a role can touch; GRANTs control whether the role
-- may touch the table at all. Supabase relies on broad grants + RLS for safety.
-- Without these, the API returns "permission denied for table ...".
-- ════════════════════════════════════════════════════════════════════════
grant usage on schema public to anon, authenticated, service_role;

grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- Apply the same to any tables/sequences/functions created later.
alter default privileges in schema public
  grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public
  grant all on routines to anon, authenticated, service_role;

-- ════════════════════════════════════════════════════════════════════════
-- ROW LEVEL SECURITY
-- ════════════════════════════════════════════════════════════════════════
alter table public.profiles            enable row level security;
alter table public.pets                enable row level security;
alter table public.services            enable row level security;
alter table public.bookings            enable row level security;
alter table public.notifications       enable row level security;
alter table public.push_subscriptions  enable row level security;

-- Helper: is the current user a provider?
create or replace function public.is_provider()
returns boolean
language sql
security definer set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'provider'
  );
$$;

-- PROFILES ----------------------------------------------------------------
drop policy if exists "profiles: self read"   on public.profiles;
drop policy if exists "profiles: self update" on public.profiles;
drop policy if exists "profiles: provider read all" on public.profiles;
create policy "profiles: self read"   on public.profiles for select using (auth.uid() = id);
create policy "profiles: self update" on public.profiles for update using (auth.uid() = id);
create policy "profiles: provider read all" on public.profiles for select using (public.is_provider());

-- PETS --------------------------------------------------------------------
drop policy if exists "pets: owner all" on public.pets;
drop policy if exists "pets: provider read" on public.pets;
create policy "pets: owner all"     on public.pets for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
create policy "pets: provider read" on public.pets for select using (public.is_provider());

-- SERVICES (everyone can read; only providers can edit) -------------------
drop policy if exists "services: read"           on public.services;
drop policy if exists "services: provider write" on public.services;
create policy "services: read"           on public.services for select using (true);
create policy "services: provider write" on public.services for all using (public.is_provider()) with check (public.is_provider());

-- BOOKINGS ----------------------------------------------------------------
drop policy if exists "bookings: customer read"   on public.bookings;
drop policy if exists "bookings: customer insert" on public.bookings;
drop policy if exists "bookings: customer cancel" on public.bookings;
drop policy if exists "bookings: provider read"   on public.bookings;
drop policy if exists "bookings: provider update" on public.bookings;
create policy "bookings: customer read"   on public.bookings for select using (auth.uid() = customer_id);
create policy "bookings: customer insert" on public.bookings for insert with check (auth.uid() = customer_id);
create policy "bookings: customer cancel" on public.bookings for update using (auth.uid() = customer_id) with check (auth.uid() = customer_id);
create policy "bookings: provider read"   on public.bookings for select using (public.is_provider());
create policy "bookings: provider update" on public.bookings for update using (public.is_provider()) with check (public.is_provider());

-- NOTIFICATIONS -----------------------------------------------------------
drop policy if exists "notif: owner read"   on public.notifications;
drop policy if exists "notif: owner update" on public.notifications;
create policy "notif: owner read"   on public.notifications for select using (auth.uid() = user_id);
create policy "notif: owner update" on public.notifications for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- PUSH SUBSCRIPTIONS ------------------------------------------------------
drop policy if exists "push: owner all" on public.push_subscriptions;
create policy "push: owner all" on public.push_subscriptions for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- ════════════════════════════════════════════════════════════════════════
-- REALTIME  (so dashboards update live)
-- ════════════════════════════════════════════════════════════════════════
alter publication supabase_realtime add table public.bookings;
alter publication supabase_realtime add table public.notifications;

-- ════════════════════════════════════════════════════════════════════════
-- SEED — the service menu
-- ════════════════════════════════════════════════════════════════════════
insert into public.services (slug, name, description, category, duration_min, price_cents, emoji, sort_order)
values
  ('walk-30', 'Quick Walk',      'A brisk 30-minute neighborhood stroll — perfect for a midday potty break and some zoomies.', 'walk', 30, 1000, '🦮', 1),
  ('walk-45', 'Happy Walk',      'A 45-minute adventure walk with plenty of sniffs, play, and fresh water.',                 'walk', 45, 1500, '🐕', 2),
  ('walk-60', 'Big Adventure',   'A full 60-minute walk with extra play time, training reinforcement & lots of love.',       'walk', 60, 2000, '🌳', 3),
  ('home-drop', 'Drop-In Visit', 'A 30-minute home visit: feeding, fresh water, potty break, and cuddles.',                  'home_care', 30, 1500, '🏡', 4),
  ('home-sit',  'Pet Sitting',   'Extended in-home care (per visit): feeding, playtime, meds, and companionship.',           'home_care', 60, 2500, '🛋️', 5)
on conflict (slug) do nothing;

-- ════════════════════════════════════════════════════════════════════════
-- STORAGE — pet photos bucket
-- Run once. Then policies allow owners to upload to their own folder.
-- ════════════════════════════════════════════════════════════════════════
insert into storage.buckets (id, name, public)
values ('pet-photos', 'pet-photos', true)
on conflict (id) do nothing;

drop policy if exists "pet photos: public read" on storage.objects;
drop policy if exists "pet photos: owner write" on storage.objects;
create policy "pet photos: public read"
  on storage.objects for select using (bucket_id = 'pet-photos');
create policy "pet photos: owner write"
  on storage.objects for insert
  with check (bucket_id = 'pet-photos' and auth.uid()::text = (storage.foldername(name))[1]);

-- 🎉 Done! Your PawPal database is ready.
