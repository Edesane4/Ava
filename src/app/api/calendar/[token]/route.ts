import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { buildIcsFeed } from "@/lib/calendar";
import type { Booking } from "@/lib/types";

// Public .ics feed of all bookings — Skylight / Apple Calendar subscribe here.
// Protected by a secret token in the path (set CALENDAR_FEED_TOKEN).
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ token: string }> },
) {
  const { token } = await params;
  const expected = process.env.CALENDAR_FEED_TOKEN;

  // 404 (not 401) so the URL's existence isn't revealed without the token.
  if (!expected || token !== expected) {
    return new NextResponse("Not found", { status: 404 });
  }

  const supabase = createAdminClient();
  const since = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data } = await supabase
    .from("bookings")
    .select("*")
    .gte("scheduled_at", since)
    .in("status", ["pending", "confirmed", "completed"])
    .order("scheduled_at", { ascending: true });

  const ics = buildIcsFeed((data as Booking[]) ?? []);

  return new NextResponse(ics, {
    headers: {
      "Content-Type": "text/calendar; charset=utf-8",
      "Content-Disposition": 'inline; filename="pawpal.ics"',
      // Let clients cache briefly; they poll on their own schedule anyway.
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}
