"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Dog, Plus } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { useBookings } from "@/hooks/useBookings";
import { BookingCard } from "@/components/BookingCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PawLoader } from "@/components/ui/Loaders";
import { EmptyState } from "@/components/ui/EmptyState";
import { useBookingStore } from "@/store/useBookingStore";

export default function DashboardPage() {
  const { user, profile, isProvider } = useSession();
  const router = useRouter();
  const { bookings, loading } = useBookings("mine", user?.id);
  const resetDraft = useBookingStore((s) => s.reset);

  // Providers get their own command center.
  useEffect(() => {
    if (isProvider) router.replace("/provider");
  }, [isProvider, router]);

  const upcoming = bookings.filter(
    (b) =>
      new Date(b.scheduled_at) >= new Date() &&
      ["pending", "confirmed"].includes(b.status),
  );

  const firstName = profile?.full_name?.split(" ")[0] ?? "friend";

  return (
    <div className="space-y-6">
      {/* Hero */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-5xl bg-gradient-to-br from-coral via-coral to-coral-dark p-6 text-white shadow-coral"
      >
        <div className="relative z-10">
          <p className="font-display text-sm font-bold opacity-90">
            Welcome back,
          </p>
          <h1 className="font-display text-3xl font-extrabold leading-tight">
            {firstName}! 🐾
          </h1>
          <p className="mt-1 max-w-[15rem] text-sm opacity-90">
            Ready to make a pup&apos;s day? Book a walk or home visit.
          </p>
          <Link href="/book" onClick={() => resetDraft()}>
            <Button variant="sunny" size="md" className="mt-4">
              Book now <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
        <span className="pointer-events-none absolute -right-4 -top-2 text-[7rem] opacity-30">
          🦮
        </span>
      </motion.section>

      {/* Quick book */}
      <section>
        <h2 className="mb-3 font-display text-lg font-extrabold text-ink">
          Quick book
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <QuickTile
            href="/services?category=walk"
            emoji="🦮"
            title="Dog Walking"
            sub="30 / 45 / 60 min"
            color="from-teal-light to-teal/30"
          />
          <QuickTile
            href="/services?category=home_care"
            emoji="🏡"
            title="Home Care"
            sub="Visits & sitting"
            color="from-coral-light to-coral/30"
          />
        </div>
      </section>

      {/* Upcoming */}
      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="font-display text-lg font-extrabold text-ink">
            Upcoming
          </h2>
          <Link
            href="/bookings"
            className="font-display text-sm font-bold text-coral hover:underline"
          >
            See all
          </Link>
        </div>

        {loading ? (
          <PawLoader label="Sniffing out your bookings…" />
        ) : upcoming.length === 0 ? (
          <EmptyState
            emoji="📅"
            title="No upcoming visits"
            subtitle="Your next adventure is just a few taps away!"
            action={
              <Link href="/book" onClick={() => resetDraft()}>
                <Button variant="coral" size="sm">
                  <Plus className="h-4 w-4" /> Book a visit
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-3">
            {upcoming.slice(0, 3).map((b) => (
              <BookingCard key={b.id} booking={b} />
            ))}
          </div>
        )}
      </section>

      {/* Pets shortcut */}
      <section>
        <Link href="/pets">
          <Card interactive className="flex items-center gap-4 bg-sunny-light/60">
            <div className="grid h-14 w-14 place-items-center rounded-3xl bg-white text-3xl">
              🐶
            </div>
            <div className="flex-1">
              <p className="font-display font-extrabold text-ink">My Pets</p>
              <p className="text-sm text-ink/60">
                Add & manage your furry friends
              </p>
            </div>
            <Dog className="h-6 w-6 text-ink/40" />
          </Card>
        </Link>
      </section>
    </div>
  );
}

function QuickTile({
  href,
  emoji,
  title,
  sub,
  color,
}: {
  href: string;
  emoji: string;
  title: string;
  sub: string;
  color: string;
}) {
  return (
    <Link href={href}>
      <Card interactive className="h-full">
        <div
          className={`mb-2 grid h-14 w-14 place-items-center rounded-3xl bg-gradient-to-br ${color} text-3xl`}
        >
          {emoji}
        </div>
        <p className="font-display font-extrabold leading-tight text-ink">
          {title}
        </p>
        <p className="text-xs text-ink/55">{sub}</p>
      </Card>
    </Link>
  );
}
