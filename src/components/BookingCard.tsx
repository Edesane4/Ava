"use client";

import { MapPin, MessageCircle } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import {
  STATUS_META,
  PAYMENT_STATUS_META,
  PAYMENT_METHOD_META,
  formatPrice,
  friendlyDate,
  friendlyTime,
} from "@/lib/utils";
import type { Booking } from "@/lib/types";

/**
 * Booking summary card. `variant="provider"` reveals the customer name
 * and renders any action buttons passed as `children`.
 */
export function BookingCard({
  booking,
  variant = "customer",
  children,
}: {
  booking: Booking;
  variant?: "customer" | "provider";
  children?: React.ReactNode;
}) {
  const status = STATUS_META[booking.status];
  const pay = PAYMENT_STATUS_META[booking.payment_status];
  const method = PAYMENT_METHOD_META[booking.payment_method];
  const customerName = booking.profiles?.full_name ?? "A happy human";

  return (
    <Card className="space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-sunny-light text-2xl">
            {booking.services?.emoji ?? "🐾"}
          </div>
          <div>
            <p className="font-display font-extrabold leading-tight text-ink">
              {booking.service_name ?? "Pet care"}
            </p>
            <p className="text-sm text-ink/60">
              for {booking.pet_name ?? "your pet"}
              {variant === "provider" && (
                <span className="text-ink/40"> · {customerName}</span>
              )}
            </p>
          </div>
        </div>
        <Badge className={status.className}>
          {status.emoji} {status.label}
        </Badge>
      </div>

      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-3 py-1 font-bold text-teal-dark">
          📅 {friendlyDate(booking.scheduled_at)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-coral/10 px-3 py-1 font-bold text-coral-dark">
          🕑 {friendlyTime(booking.scheduled_at)}
        </span>
        <span className="inline-flex items-center gap-1 rounded-full bg-sunny-light px-3 py-1 font-bold text-ink">
          {formatPrice(booking.price_cents)}
        </span>
      </div>

      {booking.address && (
        <p className="flex items-start gap-1.5 text-sm text-ink/60">
          <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
          {booking.address}
        </p>
      )}

      {booking.special_instructions && (
        <p className="flex items-start gap-1.5 rounded-2xl bg-black/[0.03] px-3 py-2 text-sm text-ink/70">
          <MessageCircle className="mt-0.5 h-4 w-4 shrink-0" />
          {booking.special_instructions}
        </p>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-ink/5 pt-3">
        <Badge className={pay.className}>
          {pay.emoji} {pay.label}
        </Badge>
        <span className="text-xs font-bold text-ink/50">
          {method.emoji} {method.label}
        </span>
      </div>

      {children && <div className="flex gap-2 pt-1">{children}</div>}
    </Card>
  );
}
