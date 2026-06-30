// ════════════════════════════════════════════════════════════════════════
// Supabase Edge Function: notify-booking  (Deno runtime)
//
// On a new booking it:
//   1. Sends a Web Push to the provider's phone:  "🎉 New client! [Pet] on [Date]"
//   2. Creates a Google Calendar event on the provider's calendar (optional)
//
// Deploy:
//   supabase functions deploy notify-booking --no-verify-jwt
//
// Secrets (set with `supabase secrets set KEY=value`):
//   SUPABASE_URL, SERVICE_ROLE_KEY            (auto-available as SUPABASE_*)
//   VAPID_PUBLIC_KEY, VAPID_PRIVATE_KEY, VAPID_SUBJECT
//   GOOGLE_CALENDAR_ID, GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY
// ════════════════════════════════════════════════════════════════════════

import { createClient } from "jsr:@supabase/supabase-js@2";
import webpush from "npm:web-push@3.6.7";
import { SignJWT, importPKCS8 } from "npm:jose@5";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

const VAPID_PUBLIC = Deno.env.get("VAPID_PUBLIC_KEY") ?? "";
const VAPID_PRIVATE = Deno.env.get("VAPID_PRIVATE_KEY") ?? "";
const VAPID_SUBJECT = Deno.env.get("VAPID_SUBJECT") ?? "mailto:hello@pawpal.app";

const GCAL_ID = Deno.env.get("GOOGLE_CALENDAR_ID") ?? "";
const GCAL_EMAIL = Deno.env.get("GOOGLE_SERVICE_ACCOUNT_EMAIL") ?? "";
const GCAL_KEY = (Deno.env.get("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY") ?? "").replace(
  /\\n/g,
  "\n",
);

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const { bookingId } = await req.json();
    if (!bookingId) {
      return json({ error: "Missing bookingId" }, 400);
    }

    const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY);

    // 1) Load the booking.
    const { data: booking, error: bErr } = await supabase
      .from("bookings")
      .select("*")
      .eq("id", bookingId)
      .single();
    if (bErr || !booking) return json({ error: "Booking not found" }, 404);

    const when = new Date(booking.scheduled_at);
    const whenLabel = when.toLocaleString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
    const pushBody = `${booking.pet_name ?? "A pet"} on ${whenLabel}`;

    // 2) Find provider(s).
    const { data: providers } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("role", "provider");
    const providerIds = (providers ?? []).map((p) => p.id);

    // 3) Web Push to every provider device.
    let pushCount = 0;
    if (VAPID_PUBLIC && VAPID_PRIVATE && providerIds.length) {
      webpush.setVapidDetails(VAPID_SUBJECT, VAPID_PUBLIC, VAPID_PRIVATE);

      const { data: subs } = await supabase
        .from("push_subscriptions")
        .select("subscription")
        .in("user_id", providerIds);

      const payload = JSON.stringify({
        title: "🎉 New client!",
        body: pushBody,
        url: "/provider",
      });

      await Promise.all(
        (subs ?? []).map(async (row) => {
          try {
            await webpush.sendNotification(row.subscription, payload);
            pushCount++;
          } catch (_e) {
            // Subscription likely expired — ignore (could prune here).
          }
        }),
      );
    }

    // 4) Google Calendar event (optional).
    let calendarCreated = false;
    if (GCAL_ID && GCAL_EMAIL && GCAL_KEY) {
      try {
        await createCalendarEvent(booking, when);
        calendarCreated = true;
      } catch (e) {
        console.error("Calendar error:", e);
      }
    }

    return json({ ok: true, pushCount, calendarCreated });
  } catch (e) {
    console.error(e);
    return json({ error: String(e) }, 500);
  }
});

// ── Helpers ───────────────────────────────────────────────────────────────

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

/** Mint a Google OAuth access token from the service-account key (JWT grant). */
async function getGoogleAccessToken(): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const key = await importPKCS8(GCAL_KEY, "RS256");
  const assertion = await new SignJWT({
    scope: "https://www.googleapis.com/auth/calendar.events",
  })
    .setProtectedHeader({ alg: "RS256", typ: "JWT" })
    .setIssuer(GCAL_EMAIL)
    .setSubject(GCAL_EMAIL)
    .setAudience("https://oauth2.googleapis.com/token")
    .setIssuedAt(now)
    .setExpirationTime(now + 3600)
    .sign(key);

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });
  const data = await res.json();
  if (!data.access_token) throw new Error("No Google access token");
  return data.access_token as string;
}

async function createCalendarEvent(
  // deno-lint-ignore no-explicit-any
  booking: any,
  start: Date,
) {
  const token = await getGoogleAccessToken();
  const end = new Date(start.getTime() + (booking.duration_min ?? 60) * 60000);

  const event = {
    summary: `🐾 ${booking.service_name} — ${booking.pet_name ?? "pet"}`,
    description: [
      `Service: ${booking.service_name}`,
      booking.special_instructions ? `Notes: ${booking.special_instructions}` : "",
      "Booked via PawPal 🐾",
    ]
      .filter(Boolean)
      .join("\n"),
    location: booking.address ?? "",
    start: { dateTime: start.toISOString() },
    end: { dateTime: end.toISOString() },
    colorId: "5",
  };

  const res = await fetch(
    `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(
      GCAL_ID,
    )}/events`,
    {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(event),
    },
  );
  if (!res.ok) throw new Error(`Calendar API ${res.status}: ${await res.text()}`);
}
