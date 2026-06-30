"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "@/components/providers/SessionProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/BookingCard";
import { Button } from "@/components/ui/Button";
import { PawLoader } from "@/components/ui/Loaders";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { cn } from "@/lib/utils";

type Filter = "upcoming" | "past";

export default function BookingsPage() {
  const { user } = useSession();
  const { bookings, loading } = useBookings("mine", user?.id);
  const supabase = getSupabaseBrowser();
  const toast = useToast();
  const [filter, setFilter] = useState<Filter>("upcoming");

  const now = Date.now();
  const upcoming = bookings.filter(
    (b) =>
      new Date(b.scheduled_at).getTime() >= now &&
      !["completed", "cancelled", "declined"].includes(b.status),
  );
  const past = bookings
    .filter(
      (b) =>
        new Date(b.scheduled_at).getTime() < now ||
        ["completed", "cancelled", "declined"].includes(b.status),
    )
    .reverse();

  const list = filter === "upcoming" ? upcoming : past;

  const cancelBooking = async (id: string) => {
    if (!confirm("Cancel this booking?")) return;
    const { error } = await supabase
      .from("bookings")
      .update({ status: "cancelled" })
      .eq("id", id);
    if (error) toast.error("Couldn't cancel 🙈");
    else toast.info("Booking cancelled");
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          My Bookings 📖
        </h1>
        <p className="text-sm text-ink/60">Every happy adventure, in one place.</p>
      </header>

      {/* Filter tabs */}
      <div className="flex gap-2 rounded-full bg-white/60 p-1">
        {(["upcoming", "past"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={cn(
              "flex-1 rounded-full py-2 font-display text-sm font-bold capitalize transition",
              filter === f
                ? "bg-coral text-white shadow-coral"
                : "text-ink/55",
            )}
          >
            {f} {f === "upcoming" ? `(${upcoming.length})` : `(${past.length})`}
          </button>
        ))}
      </div>

      {loading ? (
        <PawLoader />
      ) : list.length === 0 ? (
        <EmptyState
          emoji={filter === "upcoming" ? "📅" : "🐾"}
          title={
            filter === "upcoming"
              ? "Nothing booked yet"
              : "No past visits yet"
          }
          subtitle={
            filter === "upcoming"
              ? "Treat your pup to a walk or a visit!"
              : "Your completed adventures will show up here."
          }
          action={
            filter === "upcoming" ? (
              <Link href="/book">
                <Button variant="coral" size="sm">
                  Book a visit
                </Button>
              </Link>
            ) : undefined
          }
        />
      ) : (
        <div className="space-y-3">
          {list.map((b) => (
            <BookingCard key={b.id} booking={b}>
              {filter === "upcoming" &&
                ["pending", "confirmed"].includes(b.status) && (
                  <Button
                    variant="ghost"
                    size="sm"
                    fullWidth
                    onClick={() => cancelBooking(b.id)}
                    className="!text-coral-dark"
                  >
                    Cancel booking
                  </Button>
                )}
            </BookingCard>
          ))}
        </div>
      )}
    </div>
  );
}
