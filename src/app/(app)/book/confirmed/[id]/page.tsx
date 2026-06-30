"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { CalendarPlus, Download, PartyPopper } from "lucide-react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Celebration } from "@/components/ui/Celebration";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PawLoader } from "@/components/ui/Loaders";
import { googleCalendarUrl, downloadIcs } from "@/lib/calendar";
import { formatPrice, friendlyDateTime } from "@/lib/utils";
import type { Booking } from "@/lib/types";

export default function ConfirmedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const supabase = getSupabaseBrowser();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("bookings")
        .select("*, services(*)")
        .eq("id", id)
        .single();
      setBooking(data as Booking | null);
      setLoading(false);
    })();
  }, [supabase, id]);

  if (loading) return <PawLoader label="Wrapping it up with a bow… 🎀" />;
  if (!booking)
    return (
      <div className="py-20 text-center text-ink/60">
        Hmm, we couldn&apos;t find that booking 🙈
      </div>
    );

  return (
    <div className="relative space-y-6 py-6">
      <Celebration />

      <motion.div
        initial={{ scale: 0, rotate: -20 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 14 }}
        className="mx-auto grid h-28 w-28 place-items-center rounded-full bg-grass text-white shadow-glow"
      >
        <PartyPopper className="h-14 w-14" />
      </motion.div>

      <div className="text-center">
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="font-display text-3xl font-extrabold text-ink"
        >
          Woohoo! Booked! 🎉
        </motion.h1>
        <p className="mt-1 text-ink/60">
          {booking.pet_name ? `${booking.pet_name} is` : "Your pet is"} in for a
          treat. We&apos;ll confirm super soon!
        </p>
      </div>

      <Card className="space-y-2">
        <Row label="Service" value={`${booking.services?.emoji ?? "🐾"} ${booking.service_name}`} />
        <Row label="When" value={friendlyDateTime(booking.scheduled_at)} />
        {booking.address && <Row label="Where" value={booking.address} />}
        <Row label="Total" value={formatPrice(booking.price_cents)} />
        <Row label="Status" value="⏳ Pending confirmation" />
      </Card>

      {/* Calendar sync */}
      <div className="space-y-2">
        <p className="text-center font-display text-sm font-bold text-ink/60">
          Add it to your calendar 📅
        </p>
        <div className="flex gap-2">
          <a
            href={googleCalendarUrl(booking)}
            target="_blank"
            rel="noreferrer"
            className="flex-1"
          >
            <Button variant="outline" fullWidth size="sm">
              <CalendarPlus className="h-4 w-4" /> Google
            </Button>
          </a>
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => downloadIcs(booking)}
          >
            <Download className="h-4 w-4" /> Apple / .ics
          </Button>
        </div>
        <p className="text-center text-xs text-ink/40">
          📌 Skylight users: open the downloaded .ics or add it to the synced
          Google Calendar.
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <Link href="/bookings">
          <Button variant="coral" fullWidth size="lg">
            View my bookings
          </Button>
        </Link>
        <Link href="/dashboard">
          <Button variant="ghost" fullWidth size="sm">
            Back to home
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-ink/5 py-1.5 last:border-0">
      <span className="text-sm font-bold text-ink/45">{label}</span>
      <span className="text-right font-display text-sm font-bold text-ink">
        {value}
      </span>
    </div>
  );
}
