# 🐾 PawPal Pet Care

A joyful, installable **Progressive Web App** for booking dog walks & home pet care — built for small-scale personal use, designed to run at **zero or near-zero cost**.

- **Frontend:** Next.js 15 (App Router) · React · TypeScript · Tailwind CSS · Framer Motion
- **Backend:** Supabase (Auth · Postgres · Storage · Realtime · Edge Functions)
- **State:** Zustand (booking flow) + React Context (session) + Supabase realtime hooks
- **Hosting:** Vercel (free tier) — no App Store / Play Store needed
- **Payments:** Cash · Venmo · Zelle · Apple Cash · "Pay Now" QR — **no Stripe required**

Colorful, high-energy, bouncy, paw-tastic. 🎉

---

## ✨ Features

**Customer**
- Fun onboarding carousel, email + Google sign-in
- Home dashboard with quick-book buttons
- Services: Dog Walking (30/45/60 min) + Home Pet Care
- Pet profiles (name, photo, breed, notes) with photo upload
- Live availability calendar + multi-step booking flow
- Address (+ optional geolocation/map link) & special instructions
- Pay Now (QR + deep links) or Pay Later (Cash/Venmo/Zelle/Apple Cash)
- Celebratory confirmation + add-to-calendar (Google / .ics / Skylight)
- "My Bookings" with live status

**Provider (you)**
- Role-based dashboard (auto-assigned by email)
- Today / upcoming / all bookings with live realtime updates
- Confirm · decline · mark complete · mark paid
- Earnings + pending stats, calendar agenda
- Notifications feed + **Web Push to your phone** ("🎉 New client!")

**PWA**
- Installable on iOS & Android, full manifest + maskable icons
- Service worker: offline shell, cached bookings, push notifications
- Add-to-home-screen prompt (native on Android, guided on iOS)

---

## 🚀 Quick Start

### 0. Prerequisites
- Node.js 18.18+ (Node 20+ recommended)
- A free [Supabase](https://supabase.com) account
- A free [Vercel](https://vercel.com) account (for deploy)

### 1. Install
```bash
npm install
```

### 2. Create your Supabase project
1. Go to [supabase.com](https://supabase.com) → **New project**. Pick a name & region; save the database password.
2. Open **Project Settings → API** and copy:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE_KEY` (keep secret!)

### 3. Run the database schema
1. In Supabase → **SQL Editor → New query**.
2. ⚠️ **Open `supabase/schema.sql` and change the provider email** (search for `provider_email := 'you@example.com'`) to **your** email. Whoever signs up with that email becomes the provider.
3. Paste the whole file and click **Run**. This creates tables, RLS policies, realtime, the service menu, the photo storage bucket, and the booking/notification triggers.

### 4. Configure auth providers
- **Email:** Supabase → **Authentication → Providers → Email** is on by default. For quick local testing, you may toggle **"Confirm email"** off (Authentication → Providers → Email) so sign-ups log in immediately.
- **Google (optional but nice):** Authentication → Providers → **Google** → enable, paste a Google OAuth client ID/secret ([guide](https://supabase.com/docs/guides/auth/social-login/auth-google)). Add `https://YOUR-PROJECT.supabase.co/auth/v1/callback` as an authorized redirect URI in Google Cloud Console.
- Under **Authentication → URL Configuration**, set **Site URL** to `http://localhost:3000` for dev (and your Vercel URL for prod), and add both to **Redirect URLs**.

### 5. Environment variables
```bash
cp .env.local.example .env.local
```
Fill in `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_PROVIDER_EMAIL`, and `SUPABASE_SERVICE_ROLE_KEY`. (Push/Calendar vars are optional — see below.)

### 6. Generate app icons (optional but recommended)
```bash
npm run icons   # rasterizes the SVG into PNG icons via sharp
```
> The manifest also lists the SVG icon, so installs work even if you skip this. PNGs give the best home-screen look on iOS.

### 7. Run it!
```bash
npm run dev
```
Open **http://localhost:3000** 🎉

---

## 🗄️ Database schema (overview)

| Table | Purpose |
|---|---|
| `profiles` | 1:1 with `auth.users`; holds `role` (`customer`/`provider`) |
| `pets` | Customer pets (name, breed, photo, notes) |
| `services` | The bookable menu (seeded; provider-editable) |
| `bookings` | The core booking records (status, payment, schedule, address) |
| `notifications` | In-app feed for providers & customers |
| `push_subscriptions` | Web Push endpoints for phone notifications |

Row Level Security is **on for every table**. Customers only see their own pets/bookings; the provider sees everything. Full SQL lives in [`supabase/schema.sql`](supabase/schema.sql).

### 🎬 Want demo data?
After running the schema and signing up at least one account, run [`supabase/seed-demo.sql`](supabase/seed-demo.sql) in the SQL Editor to populate sample pets (Biscuit & Luna) and a handful of bookings across every status — great for screenshots and trying the provider dashboard. Every demo row is tagged `[DEMO]`; the file includes the two `delete` statements to remove it again.

---

## 🔔 Push notifications to your phone (optional)

So you get **"🎉 New client!"** even when the app is closed.

1. Generate VAPID keys:
   ```bash
   npx web-push generate-vapid-keys
   ```
2. Add to `.env.local`:
   ```
   NEXT_PUBLIC_VAPID_PUBLIC_KEY=...
   VAPID_PRIVATE_KEY=...
   VAPID_SUBJECT=mailto:you@example.com
   ```
3. Deploy the Edge Function (next section).
4. Install the PWA on your phone, open **Notifications → "Get push alerts → On"**, allow notifications.

> iOS note: Web Push works on iOS **16.4+** but only **after** the app is installed to the Home Screen.

---

## ⚡ Edge Function: notifications + Google Calendar

[`supabase/functions/notify-booking`](supabase/functions/notify-booking/index.ts) sends the Web Push and (optionally) creates a Google Calendar event when a booking is made.

```bash
# Install the CLI once: https://supabase.com/docs/guides/cli
supabase login
supabase link --project-ref YOUR-PROJECT-REF

# Set secrets
supabase secrets set VAPID_PUBLIC_KEY=... VAPID_PRIVATE_KEY=... VAPID_SUBJECT=mailto:you@example.com

# (Optional) Google Calendar — service account with Calendar API enabled,
# and the target calendar shared with the service account email:
supabase secrets set \
  GOOGLE_CALENDAR_ID=primary \
  GOOGLE_SERVICE_ACCOUNT_EMAIL=svc@project.iam.gserviceaccount.com \
  GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"

# Deploy
supabase functions deploy notify-booking --no-verify-jwt
```

The app calls this through the server route `/api/notify` after each booking. If the function isn't deployed, bookings still work — the database trigger already creates the in-app notification.

> **No Google account?** Skip the calendar vars entirely. Customers still get one-tap **Add to Google Calendar** and **.ics download** (works with Apple Calendar & **Skylight** — just open the `.ics` or add it to a synced Google Calendar) on the confirmation screen.

---

## ☁️ Deploy to Vercel (free)

1. Push this repo to GitHub.
2. Go to [vercel.com/new](https://vercel.com/new) → **Import** the repo (Vercel auto-detects Next.js).
3. Add Environment Variables (same as `.env.local`):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `NEXT_PUBLIC_PROVIDER_EMAIL`, `SUPABASE_SERVICE_ROLE_KEY`, and the optional `NEXT_PUBLIC_VAPID_PUBLIC_KEY`.
4. Click **Deploy**. You'll get a free `https://your-app.vercel.app` URL.
5. Back in Supabase → **Authentication → URL Configuration**, add your Vercel URL to **Site URL** and **Redirect URLs**. Update the Google OAuth redirect URIs too if you use Google.

That's it — free hosting, free HTTPS, auto-deploys on every push. 🎉

---

## 📲 Test the PWA install on your phone

**iPhone (Safari)**
1. Open your Vercel URL in **Safari**.
2. Tap the **Share** button → **Add to Home Screen** → **Add**.
3. Launch **PawPal** from the home screen — it opens full-screen, no browser bar.

**Android (Chrome)**
1. Open your Vercel URL in **Chrome**.
2. Tap the in-app **"Add to Home Screen"** banner, or **⋮ → Install app**.
3. Launch from the app drawer.

**Verify offline:** open the app, load your bookings, then turn on Airplane Mode and reopen — you'll see the offline banner and your **cached bookings**.

> Service workers only run in production builds. Test locally with `npm run build && npm run start`, or just use your Vercel deploy.

---

## 🎨 Customize

- **Brand colors / animations:** [`tailwind.config.ts`](tailwind.config.ts)
- **Service menu & prices:** edit the `services` table (Supabase Table Editor) or the seed in `schema.sql`
- **Payment handles (Venmo/Zelle/Apple Cash + QR):** [`src/lib/payment-config.ts`](src/lib/payment-config.ts)
- **Working hours / slot times:** `buildTimeSlots()` in [`src/lib/utils.ts`](src/lib/utils.ts)

---

## 🧰 Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm run start` | Run the production build (test the service worker here) |
| `npm run lint` | Lint |
| `npm run typecheck` | TypeScript check |
| `npm run icons` | Generate PNG icons from the SVG masters |

---

## 📁 Project structure

```
.
├── public/
│   ├── manifest.json          # PWA manifest
│   ├── sw.js                  # service worker (offline + push)
│   └── icons/                 # SVG masters (+ generated PNGs)
├── scripts/generate-icons.mjs # SVG → PNG icon generator
├── supabase/
│   ├── schema.sql             # tables, RLS, realtime, seed, triggers
│   └── functions/notify-booking/  # Edge Function (push + GCal)
├── middleware.ts              # session refresh + route guards
└── src/
    ├── app/                   # routes (App Router)
    │   ├── page.tsx           # onboarding
    │   ├── login/             # auth
    │   ├── offline/           # offline fallback
    │   ├── auth/callback/     # OAuth handler
    │   ├── api/notify/        # → Edge Function proxy
    │   └── (app)/             # authenticated shell
    │       ├── dashboard, services, pets, book, bookings,
    │       ├── notifications, profile
    │       └── provider/      # provider dashboard + calendar
    ├── components/            # UI, nav, booking steps, providers, pwa
    ├── hooks/                 # bookings, pets, services, availability, notifications
    ├── lib/                   # supabase clients, types, utils, calendar, payments
    └── store/                 # Zustand booking store
```

---

Made with 💛 for happy pups and the humans who love them. 🐶🦴
