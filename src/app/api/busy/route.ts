import { NextResponse } from "next/server";
import ical from "node-ical";

// Reads the provider's published iCloud/Google .ics (PROVIDER_BUSY_ICS_URL)
// and returns busy intervals for a given day, so the booking picker can black
// out times the provider is unavailable.
//
// Response: { busy: [{ start: <ms>, end: <ms> }, ...] }
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

interface Interval {
  start: number;
  end: number;
}

// The bits of a node-ical VEVENT we actually use (its exported types don't
// surface rrule/exdate cleanly, so we narrow to what we need).
interface VEventLike {
  type?: string;
  start?: Date;
  end?: Date;
  rrule?: { between(after: Date, before: Date, inc?: boolean): Date[] };
  exdate?: Record<string, Date>;
}

export async function GET(req: Request) {
  const url = process.env.PROVIDER_BUSY_ICS_URL;
  if (!url) return NextResponse.json({ busy: [] as Interval[] });

  const { searchParams } = new URL(req.url);
  const dateParam = searchParams.get("date"); // YYYY-MM-DD (local to the client)
  const base = dateParam ? new Date(`${dateParam}T12:00:00`) : new Date();
  const dayStart = new Date(base);
  dayStart.setHours(0, 0, 0, 0);
  const dayEnd = new Date(base);
  dayEnd.setHours(23, 59, 59, 999);

  try {
    // Apple hands out webcal:// links — normalise to https for fetching.
    const httpsUrl = url.replace(/^webcal:\/\//i, "https://");
    const data = await ical.async.fromURL(httpsUrl);

    const busy: Interval[] = [];
    const overlaps = (s: number, e: number) =>
      e > dayStart.getTime() && s < dayEnd.getTime();

    for (const key of Object.keys(data)) {
      const ev = data[key] as unknown as VEventLike;
      if (!ev || ev.type !== "VEVENT" || !ev.start) continue;

      const evStart = new Date(ev.start);
      const evEnd = ev.end
        ? new Date(ev.end)
        : new Date(evStart.getTime() + 60 * 60 * 1000);
      const durationMs = Math.max(0, evEnd.getTime() - evStart.getTime());

      // ── Recurring event: expand occurrences around the target day ──
      const rrule = ev.rrule;
      if (rrule) {
        const exdates: Record<string, Date> = ev.exdate ?? {};
        const winStart = new Date(dayStart.getTime() - durationMs - 86400000);
        const winEnd = new Date(dayEnd.getTime() + 86400000);
        const occurrences: Date[] = rrule.between(winStart, winEnd, true);

        for (const occ of occurrences) {
          // Skip cancelled occurrences (EXDATE).
          const dayKey = occ.toISOString().slice(0, 10);
          if (exdates[dayKey]) continue;
          const s = occ.getTime();
          const e = s + durationMs;
          if (overlaps(s, e)) busy.push({ start: s, end: e });
        }
        continue;
      }

      // ── Single event ──
      if (overlaps(evStart.getTime(), evEnd.getTime())) {
        busy.push({ start: evStart.getTime(), end: evEnd.getTime() });
      }
    }

    return NextResponse.json({ busy });
  } catch {
    // Bad/unreachable URL → just don't block anything.
    return NextResponse.json({ busy: [] as Interval[] });
  }
}
