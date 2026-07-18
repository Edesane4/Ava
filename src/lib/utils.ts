import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistanceToNow, isToday, isTomorrow } from "date-fns";
import type {
  BookingStatus,
  PaymentMethod,
  PaymentStatus,
} from "@/lib/types";

/** Tailwind-aware className combiner. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/** $20.00 from 2000 cents. */
export function formatPrice(cents: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(cents / 100);
}

/**
 * Safely parse a timestamp into a Date.
 * Postgres/PostgREST returns microsecond precision (…:00.123456+00), which
 * Safari/iOS cannot parse → "Invalid Date". Trim fractional seconds to 3
 * digits so every browser can parse database timestamps reliably.
 */
export function toSafeDate(value: string | number | Date): Date {
  if (value instanceof Date) return value;
  if (typeof value === "number") return new Date(value);
  return new Date(value.replace(/(\.\d{3})\d+/, "$1"));
}

/**
 * Relative time ("2 hours ago") that can NEVER throw — a bad/invalid date
 * falls back to a friendly string instead of crashing the render.
 */
export function safeRelativeTime(value: string | number | Date): string {
  try {
    const d = toSafeDate(value);
    if (Number.isNaN(d.getTime())) return "recently";
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return "recently";
  }
}

/** Friendly date: "Today", "Tomorrow", or "Mon, Jul 14". */
export function friendlyDate(iso: string | Date) {
  const d = toSafeDate(iso);
  if (isToday(d)) return "Today";
  if (isTomorrow(d)) return "Tomorrow";
  return format(d, "EEE, MMM d");
}

/** "3:30 PM" */
export function friendlyTime(iso: string | Date) {
  const d = toSafeDate(iso);
  return format(d, "h:mm a");
}

export function friendlyDateTime(iso: string | Date) {
  return `${friendlyDate(iso)} • ${friendlyTime(iso)}`;
}

export const STATUS_META: Record<
  BookingStatus,
  { label: string; emoji: string; className: string }
> = {
  pending: {
    label: "Pending",
    emoji: "⏳",
    className: "bg-sunny-light text-ink",
  },
  confirmed: {
    label: "Confirmed",
    emoji: "✅",
    className: "bg-teal-light text-teal-dark",
  },
  declined: {
    label: "Declined",
    emoji: "🙈",
    className: "bg-coral-light text-coral-dark",
  },
  completed: {
    label: "Completed",
    emoji: "🎉",
    className: "bg-grass-light/40 text-grass-dark",
  },
  cancelled: {
    label: "Cancelled",
    emoji: "🚫",
    className: "bg-gray-200 text-gray-600",
  },
};

export const PAYMENT_METHOD_META: Record<
  PaymentMethod,
  { label: string; emoji: string }
> = {
  pay_now: { label: "Pay Now", emoji: "⚡" },
  cash: { label: "Cash", emoji: "💵" },
  venmo: { label: "Venmo", emoji: "🟦" },
  zelle: { label: "Zelle", emoji: "🟪" },
  apple_cash: { label: "Apple Cash", emoji: "🍎" },
};

export const PAYMENT_STATUS_META: Record<
  PaymentStatus,
  { label: string; emoji: string; className: string }
> = {
  unpaid: { label: "Unpaid", emoji: "💸", className: "bg-sunny-light text-ink" },
  paid: { label: "Paid", emoji: "✅", className: "bg-grass-light/40 text-grass-dark" },
};

/** A cute fallback avatar from a pet's name (no upload required). */
export function petAvatar(name: string, photoUrl?: string | null) {
  if (photoUrl) return photoUrl;
  const seed = encodeURIComponent(name || "buddy");
  return `https://api.dicebear.com/9.x/big-ears-neutral/svg?seed=${seed}&backgroundColor=ffd5dc,c0aede,b6e3f4,d1f4d9`;
}

/** 🐶 / 🐱 badge for a pet's species. Defaults to dog. */
export function speciesEmoji(species?: string | null) {
  return species === "cat" ? "🐱" : "🐶";
}

/** Build 30-minute time slots between start and end hour (local time). */
export function buildTimeSlots(date: Date, startHour = 8, endHour = 19) {
  const slots: Date[] = [];
  for (let h = startHour; h <= endHour; h++) {
    for (const m of [0, 30]) {
      if (h === endHour && m > 0) continue;
      const slot = new Date(date);
      slot.setHours(h, m, 0, 0);
      slots.push(slot);
    }
  }
  return slots;
}

/** Has this slot already passed (for today)? */
export function isPast(date: Date) {
  return date.getTime() < Date.now();
}
