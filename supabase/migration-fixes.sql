-- ════════════════════════════════════════════════════════════════════════
-- PawPal — bug-fix migration (run once on your EXISTING Supabase project)
-- Supabase → SQL Editor → New query → paste → Run.
-- Safe to re-run (idempotent).
-- ════════════════════════════════════════════════════════════════════════

-- (4) Cats: add a species column to pets ---------------------------------
alter table public.pets
  add column if not exists species text not null default 'dog';
-- enforce allowed values (drop first so re-runs don't error)
alter table public.pets drop constraint if exists pets_species_check;
alter table public.pets
  add constraint pets_species_check check (species in ('dog', 'cat'));

-- (5) Multiple pets per booking: add an array of pet ids ------------------
alter table public.bookings
  add column if not exists pet_ids uuid[] default '{}';

-- (1) Remove the "Overnight Stay" service --------------------------------
delete from public.services where slug = 'home-overnight';

-- (2) Update service prices (cents) --------------------------------------
update public.services set price_cents = 1000 where slug = 'walk-30';   -- Quick Walk    $10
update public.services set price_cents = 1500 where slug = 'walk-45';   -- Happy Walk    $15
update public.services set price_cents = 2000 where slug = 'walk-60';   -- Big Adventure $20
update public.services set price_cents = 1500 where slug = 'home-drop'; -- Drop-In Visit $15
update public.services set price_cents = 2500 where slug = 'home-sit';  -- Pet Sitting   $25

-- ✅ Done. Verify:
--   select name, price_cents from public.services order by sort_order;
