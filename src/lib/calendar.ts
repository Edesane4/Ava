import { format } from "date-fns";
import type { Booking } from "@/lib/types";

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
