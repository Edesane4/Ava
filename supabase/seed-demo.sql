-- ════════════════════════════════════════════════════════════════════════
-- PawPal — DEMO DATA (optional)
-- Seeds sample pets + bookings so you can see the app fully populated.
--
-- HOW TO USE:
--   1. Run supabase/schema.sql first.
--   2. Sign up at least ONE account in the app (this becomes the "customer"
--      the demo data is attached to). Signing up your provider email too is
--      fine — the script prefers a non-provider customer if one exists.
--   3. Run this file in Supabase → SQL Editor.
--
-- Every demo row is tagged with '[DEMO]' so you can remove it later with:
--   delete from public.bookings where special_instructions like '[DEMO]%';
--   delete from public.pets     where notes like '[DEMO]%';
-- ════════════════════════════════════════════════════════════════════════

do $$
declare
  v_customer uuid;
  v_pet_biscuit uuid;
  v_pet_luna uuid;
  s_walk30  uuid;
  s_walk60  uuid;
  s_drop    uuid;
  s_sit     uuid;
begin
  -- Pick a customer to own the demo data: prefer a real customer, else anyone.
  select id into v_customer from public.profiles where role = 'customer'
    order by created_at limit 1;
  if v_customer is null then
    select id into v_customer from public.profiles order by created_at limit 1;
  end if;

  if v_customer is null then
    raise notice 'No profiles found — sign up in the app first, then re-run.';
    return;
  end if;

  -- Grab service ids from the seeded menu.
  select id into s_walk30 from public.services where slug = 'walk-30';
  select id into s_walk60 from public.services where slug = 'walk-60';
  select id into s_drop   from public.services where slug = 'home-drop';
  select id into s_sit    from public.services where slug = 'home-sit';

  -- ── Demo pets ──────────────────────────────────────────────────────────
  insert into public.pets (owner_id, name, breed, notes, photo_url)
  values
    (v_customer, 'Biscuit', 'Golden Retriever',
     '[DEMO] Loves belly rubs & tennis balls. Friendly with everyone!',
     'https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=Biscuit&backgroundColor=ffd5dc'),
    (v_customer, 'Luna', 'Border Collie',
     '[DEMO] Super smart, a little shy at first. Treats in the blue jar.',
     'https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=Luna&backgroundColor=b6e3f4')
  returning id into v_pet_biscuit;
  -- (returning above captures the first row; fetch Luna explicitly)
  select id into v_pet_luna from public.pets
    where owner_id = v_customer and name = 'Luna' and notes like '[DEMO]%'
    order by created_at desc limit 1;
  select id into v_pet_biscuit from public.pets
    where owner_id = v_customer and name = 'Biscuit' and notes like '[DEMO]%'
    order by created_at desc limit 1;

  -- ── Demo bookings (varied statuses & times) ────────────────────────────
  -- Pending request for today
  insert into public.bookings
    (customer_id, pet_id, service_id, service_name, pet_name, price_cents,
     scheduled_at, duration_min, address, special_instructions,
     status, payment_method, payment_status)
  values
    (v_customer, v_pet_biscuit, s_walk30, 'Quick Walk', 'Biscuit', 2000,
     date_trunc('day', now()) + interval '15 hours', 30,
     '123 Bark Street', '[DEMO] Leash by the front door.',
     'pending', 'venmo', 'unpaid'),

  -- Confirmed, tomorrow
    (v_customer, v_pet_luna, s_walk60, 'Big Adventure', 'Luna', 3500,
     date_trunc('day', now()) + interval '1 day' + interval '10 hours', 60,
     '123 Bark Street', '[DEMO] She loves the park on Oak Ave.',
     'confirmed', 'zelle', 'unpaid'),

  -- Confirmed home visit, in 3 days, paid up front
    (v_customer, v_pet_biscuit, s_drop, 'Drop-In Visit', 'Biscuit', 2500,
     date_trunc('day', now()) + interval '3 days' + interval '12 hours', 30,
     '123 Bark Street', '[DEMO] Gate code 1234. Fresh water please!',
     'confirmed', 'pay_now', 'paid'),

  -- Completed last week (paid)
    (v_customer, v_pet_luna, s_sit, 'Pet Sitting', 'Luna', 4500,
     date_trunc('day', now()) - interval '6 days' + interval '9 hours', 60,
     '123 Bark Street', '[DEMO] Thanks again — Luna had a blast!',
     'completed', 'cash', 'paid'),

  -- Completed two weeks ago (paid)
    (v_customer, v_pet_biscuit, s_walk30, 'Quick Walk', 'Biscuit', 2000,
     date_trunc('day', now()) - interval '14 days' + interval '16 hours', 30,
     '123 Bark Street', '[DEMO] Quick lunchtime potty break.',
     'completed', 'apple_cash', 'paid');

  raise notice 'Demo data seeded for customer %', v_customer;
end $$;
