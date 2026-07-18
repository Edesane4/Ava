import { format } from "date-fns";
import type { Booking } from "@/lib/types";
import { toSafeDate } from "@/lib/utils";

// ─────────────────────────────────────────────────────────────
// Free "copy to calendar" helpers — no API needed on the client.
// (The Edge Function additionally creates a real Google Calendar event
//  on the PROVIDER's calendar; these are for the CUSTOMER's convenience.)
// ─────────────────────────────────────────────────────────────

function toCalDate(d: Date) {
  // UTC basic format: 20260714T153000Z
  return format(
    new Date(d.getTime() - d.getTimezoneOffset() * 0),
    "yyyyMMdd'T'HHmmss",
  );
}

function endTime(b: Booking) {
  const start = new Date(b.scheduled_at);
  const mins = b.duration_min ?? 60;
  return new Date(start.getTime() + mins * 60000);
}

/** Google Calendar "add event" URL (opens prefilled). */
export function googleCalendarUrl(b: Booking) {
  const start = new Date(b.scheduled_at);
  const title = `PawPal: ${b.service_name ?? "Pet care"} for ${b.pet_name ?? "pet"}`;
  const details = [
    `Service: ${b.service_name}`,
    b.special_instructions ? `Notes: ${b.special_instructions}` : "",
    "Booked via PawPal 🐾",
  ]
    .filter(Boolean)
    .join("\n");
  const params = new URLSearchParams({
    action: "TEMPLATE",
    text: title,
    dates: `${toCalDate(start)}/${toCalDate(endTime(b))}`,
    details,
    location: b.address ?? "",
  });
  return `https://calendar.google.com/calendar/render?${params.toString()}`;
}

/** Build a downloadable .ics file body (works with Apple Calendar, Skylight, etc.). */
export function buildIcs(b: Booking) {
  const start = new Date(b.scheduled_at);
  const uid = `${b.id}@pawpal`;
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PawPal//EN",
    "BEGIN:VEVENT",
    `UID:${uid}`,
    `DTSTAMP:${toCalDate(start)}`,
    `DTSTART:${toCalDate(start)}`,
    `DTEND:${toCalDate(endTime(b))}`,
    `SUMMARY:PawPal: ${b.service_name} for ${b.pet_name ?? "pet"}`,
    `DESCRIPTION:${(b.special_instructions ?? "Booked via PawPal").replace(/\n/g, "\\n")}`,
    `LOCATION:${b.address ?? ""}`,
    "END:VEVENT",
    "END:VCALENDAR",
  ].join("\r\n");
}

/** Trigger a browser download of the .ics file. */
export function downloadIcs(b: Booking) {
  const blob = new Blob([buildIcs(b)], { type: "text/calendar" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `pawpal-${b.id.slice(0, 8)}.ics`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─────────────────────────────────────────────────────────────
// Subscribable calendar FEED (Flow 1): one VCALENDAR containing all
// bookings, served at /api/calendar/<token>.ics. Skylight & Apple
// Calendar subscribe to this URL and mirror your appointments.
// ─────────────────────────────────────────────────────────────

/** UTC basic format with trailing Z: 20260718T153000Z */
function toIcsUtc(d: Date) {
  return d.toISOString().replace(/[-:]/g, "").replace(/\.\d+/, "");
}

/** Escape a value for an iCalendar text field. */
function escapeIcs(s: string) {
  return s
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** One VEVENT block for a booking. */
export function bookingToVevent(b: Booking): string {
  const start = toSafeDate(b.scheduled_at);
  const end = new Date(start.getTime() + (b.duration_min ?? 60) * 60000);
  const description = [
    `Service: ${b.service_name ?? "Pet care"}`,
    b.pet_name ? `Pet: ${b.pet_name}` : "",
    b.address ? `Where: ${b.address}` : "",
    b.special_instructions ? `Notes: ${b.special_instructions}` : "",
    `Status: ${b.status}`,
    "Booked via PawPal 🐾",
  ]
    .filter(Boolean)
    .map(escapeIcs)
    .join("\\n");

  return [
    "BEGIN:VEVENT",
    `UID:${b.id}@pawpal`,
    `DTSTAMP:${toIcsUtc(new Date())}`,
    `DTSTART:${toIcsUtc(start)}`,
    `DTEND:${toIcsUtc(end)}`,
    `SUMMARY:${escapeIcs(`🐾 ${b.service_name ?? "Pet care"} — ${b.pet_name ?? "pet"}`)}`,
    `DESCRIPTION:${description}`,
    b.address ? `LOCATION:${escapeIcs(b.address)}` : "",
    `STATUS:${b.status === "confirmed" ? "CONFIRMED" : "TENTATIVE"}`,
    "END:VEVENT",
  ]
    .filter(Boolean)
    .join("\r\n");
}

/** Full VCALENDAR feed for a list of bookings. */
export function buildIcsFeed(bookings: Booking[], name = "PawPal Bookings"): string {
  return [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//PawPal//Bookings//EN",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    `X-WR-CALNAME:${escapeIcs(name)}`,
    "X-PUBLISHED-TTL:PT1H",
    "REFRESH-INTERVAL;VALUE=DURATION:PT1H",
    ...bookings.map(bookingToVevent),
    "END:VCALENDAR",
  ].join("\r\n");
}
