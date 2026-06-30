import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Lightweight server route the booking flow pings after a booking is created.
 *
 * It forwards the booking to the Supabase Edge Function `notify-booking`
 * (which sends Web Push to the provider + creates a Google Calendar event).
 *
 * Why a thin proxy? It keeps the Edge Function URL/keys on the server and
 * means the client only ever calls our own origin. If you haven't deployed
 * the Edge Function yet, this still succeeds quietly — the in-app
 * notification was already created by the database trigger.
 */
export async function POST(request: Request) {
  try {
    const { bookingId } = await request.json();
    if (!bookingId) {
      return NextResponse.json({ error: "Missing bookingId" }, { status: 400 });
    }

    // Confirm the caller is signed in (basic guard).
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const fnUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/notify-booking`;

    // Fire the Edge Function. Don't block the user on failures.
    try {
      await fetch(fnUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY ?? ""}`,
        },
        body: JSON.stringify({ bookingId }),
      });
    } catch {
      // Edge Function not deployed / offline — fine, trigger already notified.
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: true }); // never block booking UX
  }
}
