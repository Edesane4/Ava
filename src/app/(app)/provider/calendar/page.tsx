"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { useSession } from "@/components/providers/SessionProvider";
import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/BookingCard";
import { PawLoader } from "@/components/ui/Loaders";
import { EmptyState } from "@/components/ui/EmptyState";
import { friendlyDate } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export default function ProviderCalendarPage() {
  const { user, isProvider, loading: sessionLoading } = useSession();
  const router = useRouter();
  const { bookings, loading } = useBookings("provider", user?.id);

  useEffect(() => {
    if (!sessionLoading && !isProvider) router.replace("/dashboard");
  }, [sessionLoading, isProvider, router]);

  // Group upcoming, non-cancelled bookings by calendar day.
  const grouped = useMemo(() => {
    const map = new Map<string, Booking[]>();
    bookings
      .filter(
        (b) =>
          new Date(b.scheduled_at).getTime() >= Date.now() - 86400000 &&
          b.status !== "cancelled" &&
          b.status !== "declined",
      )
      .forEach((b) => {
        const key = new Date(b.scheduled_at).toDateString();
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push(b);
      });
    return Array.from(map.entries());
  }, [bookings]);

  if (sessionLoading || loading) return <PawLoader />;

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Calendar 📅
        </h1>
        <p className="text-sm text-ink/60">Your upcoming visits, day by day.</p>
      </header>

      {grouped.length === 0 ? (
        <EmptyState emoji="🗓️" title="Open schedule" subtitle="No upcoming visits booked." />
      ) : (
        <div className="space-y-6">
          {grouped.map(([day, items]) => (
            <section key={day}>
              <div className="mb-2 flex items-center gap-2">
                <span className="rounded-full bg-coral px-3 py-1 font-display text-sm font-extrabold text-white">
                  {friendlyDate(new Date(day))}
                </span>
                <span className="text-xs font-bold text-ink/40">
                  {format(new Date(day), "MMMM d")} · {items.length} visit
                  {items.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-3">
                {items.map((b) => (
                  <BookingCard key={b.id} booking={b} variant="provider" />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </div>
  );
}
