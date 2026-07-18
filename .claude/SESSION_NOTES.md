# PawPal — Session Review (last updated 2026-06-30)

Quick-resume notes for where we left off. Not committed to git (see .gitignore).

## TL;DR — the app is LIVE and shareable
- **Live URL:** https://ava-mocha.vercel.app  (email sign-up only)
- Deployed on Vercel, backed by a fully-configured Supabase project.
- Last thing we did: hid the broken "Continue with Google" button and redeployed.

## What this project is
PawPal Pet Care — a Next.js 15 + Supabase PWA for booking dog walks & home pet
care. Repo: `Edesane4/Ava`, local dir `/Users/eddiedesane/Documents/GitHub/Ava`.
edesane4@gmail.com is the auto-assigned "provider"; everyone else is a customer.

## Key facts / coordinates
- Vercel scope/account: `edesane4-2970`, project name: `ava`
- Supabase project ref: `jqngsblxbbwzkdutuaik`
  - URL: https://jqngsblxbbwzkdutuaik.supabase.co
- Vercel env vars (set in Production/Preview/Development):
  `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_PROVIDER_EMAIL` (edesane4@gmail.com), `SUPABASE_SERVICE_ROLE_KEY`
- DB verified live: schema applied, RLS works, services seeded.

## What we did this session
1. Reconnected after a disconnect (no prior chat history survived).
2. Chose to deploy to Vercel via the CLI; user approved the device login.
3. Found the dashboard import had created ONE broken env var literally named
   `jqngsblxbbwzkdutuaik` with an empty value — removed it.
4. Set all 4 correct env vars across all environments.
5. Redeployed to production; smoke-tested (HTTP 200, no runtime errors).
6. Verified the Supabase DB: services menu seeded, auth healthy.
7. User fixed the Supabase Auth URL Configuration (Site URL + Redirect URLs).
8. Diagnosed the Google sign-in error = "provider is not enabled" (Google OAuth
   was never set up). Hid the Google button + handler + glyph in
   `src/app/login/page.tsx`, committed, pushed, redeployed. Verified gone.

## Service pricing (in services.price_cents, cents)
walk-30 Quick Walk $20 | walk-45 Happy Walk $28 | walk-60 Big Adventure $35 |
home-drop Drop-In $25 | home-sit Pet Sitting $45 | home-overnight Overnight $75
Change via Supabase SQL Editor: `update public.services set price_cents = NNNN where slug = '...';`
(App reads prices live — no redeploy needed.)

## Outstanding / next steps
- [ ] **Decide email-confirmation behavior** — Supabase → Auth → Providers → Email.
      On = users confirm via email (free mailer is rate-limited); Off = instant signup.
      Do a test signup first either way.
- [ ] **Rotate the service_role key** — it was pasted in chat once. Supabase →
      Settings → API → Reset, then update the Vercel env var + redeploy. (User
      chose to hold off for now.)
- [ ] Optional: set up Google OAuth properly, then restore the login button
      (handleGoogle/GoogleGlyph — see git history before commit that hid it).
- [ ] Optional: deploy the `notify-booking` edge function; add VAPID push keys.
- [ ] Not yet done: an end-to-end booking test through to the provider dashboard.

## How to redeploy (from the Ava dir)
`npx vercel --prod --yes`  (CLI is already logged in as edesane4-2970)
