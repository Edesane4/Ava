"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { isToday } from "date-fns";
import { Check, DollarSign, X } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/BookingCard";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PawLoader } from "@/components/ui/Loaders";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { formatPrice, cn } from "@/lib/utils";
import type { Booking, BookingStatus, PaymentStatus } from "@/lib/types";

type Filter = "today" | "upcoming" | "all";

export default function ProviderPage() {
  const { user, profile, isProvider, loading: sessionLoading } = useSession();
  const router = useRouter();
  const supabase = getSupabaseBrowser();
  const toast = useToast();
  const { bookings, loading } = useBookings("provider", user?.id);
  const [filter, setFilter] = useState<Filter>("today");

  // Guard: only providers belong here.
  useEffect(() => {
    if (!sessionLoading && !isProvider) router.replace("/dashboard");
  }, [sessionLoading, isProvider, router]);

  const now = Date.now();

  const setStatus = async (id: string, status: BookingStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ status })
      .eq("id", id);
    if (error) toast.error("Update failed 🙈");
    else
      toast.success(
        status === "confirmed"
          ? "Confirmed! 🎉"
          : status === "declined"
            ? "Declined"
            : "Updated!",
      );
  };

  const setPayment = async (id: string, payment_status: PaymentStatus) => {
    const { error } = await supabase
      .from("bookings")
      .update({ payment_status })
      .eq("id", id);
    if (error) toast.error("Update failed 🙈");
    else toast.success("Marked as paid! 💵");
  };

  const visible = useMemo(() => {
    return bookings.filter((b) => {
      const t = new Date(b.scheduled_at).getTime();
      if (filter === "today") return isToday(new Date(b.scheduled_at));
      if (filter === "upcoming")
        return t >= now && b.status !== "cancelled";
      return true;
    });
  }, [bookings, filter, now]);

  const stats = useMemo(() => {
    const todays = bookings.filter((b) => isToday(new Date(b.scheduled_at)));
    const pending = bookings.filter((b) => b.status === "pending");
    const earnings = bookings
      .filter((b) => b.payment_status === "paid")
      .reduce((sum, b) => sum + b.price_cents, 0);
    return { today: todays.length, pending: pending.length, earnings };
  }, [bookings]);

  if (sessionLoading || (loading && bookings.length === 0))
    return <PawLoader label="Loading your day… 🦴" />;

  const firstName = profile?.full_name?.split(" ")[0] ?? "boss";

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Hey {firstName}! 🐾
        </h1>
        <p className="text-sm text-ink/60">Here&apos;s your pack for today.</p>
      </header>

      {/* Stat tiles */}
      <div className="grid grid-cols-3 gap-2">
        <StatTile label="Today" value={String(stats.today)} emoji="📅" color="bg-teal/15 text-teal-dark" />
        <StatTile label="Pending" value={String(stats.pending)} emoji="⏳" color="bg-sunny-light text-ink" />
        <StatTile
          label="Earned"
          value={formatPrice(stats.earnings)}
          emoji="💰"
          color="bg-grass-light/40 text-grass-dark"
        />
      </div>

      {/* Filters */}
      <div className="flex gap-2 rounded-full bg-white/60 p-1">
        {(["today", "upcoming", "all"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 rounded-full py-2 font-display text-sm font-bold capitalize transition",
              filter === f ? "bg-coral text-white shadow-coral" : "text-ink/55",
            )}
          >
            {f}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <EmptyState
          emoji="🦴"
          title="All clear!"
          subtitle="No bookings here right now. Time for a treat break."
        />
      ) : (
        <div className="space-y-3">
          {visible.map((b) => (
            <BookingCard key={b.id} booking={b} variant="provider">
              <ProviderActions
                booking={b}
                onConfirm={() => setStatus(b.id, "confirmed")}
                onDecline={() => setStatus(b.id, "declined")}
                onComplete={() => setStatus(b.id, "completed")}
                onMarkPaid={() => setPayment(b.id, "paid")}
              />
            </BookingCard>
          ))}
        </div>
      )}
    </div>
  );
}

function StatTile({
  label,
  value,
  emoji,
  color,
}: {
  label: string;
  value: string;
  emoji: string;
  color: string;
}) {
  return (
    <Card className="!p-3 text-center">
      <div className={cn("mx-auto mb-1 grid h-9 w-9 place-items-center rounded-full text-lg", color)}>
        {emoji}
      </div>
      <p className="font-display text-lg font-extrabold leading-none text-ink">
        {value}
      </p>
      <p className="text-[11px] font-bold text-ink/50">{label}</p>
    </Card>
  );
}

function ProviderActions({
  booking,
  onConfirm,
  onDecline,
  onComplete,
  onMarkPaid,
}: {
  booking: Booking;
  onConfirm: () => void;
  onDecline: () => void;
  onComplete: () => void;
  onMarkPaid: () => void;
}) {
  return (
    <div className="flex w-full flex-wrap gap-2">
      {booking.status === "pending" && (
        <>
          <Button variant="teal" size="sm" className="flex-1" onClick={onConfirm}>
            <Check className="h-4 w-4" /> Confirm
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDecline}
            className="!text-coral-dark"
          >
            <X className="h-4 w-4" /> Decline
          </Button>
        </>
      )}
      {booking.status === "confirmed" && (
        <Button variant="sunny" size="sm" className="flex-1" onClick={onComplete}>
          🎉 Mark complete
        </Button>
      )}
      {booking.payment_status === "unpaid" &&
        booking.status !== "declined" &&
        booking.status !== "cancelled" && (
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={onMarkPaid}
          >
            <DollarSign className="h-4 w-4" /> Mark paid
          </Button>
        )}
    </div>
  );
}
