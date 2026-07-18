"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

/**
 * Real-time availability for a given day. Returns the set of taken slot
 * timestamps (ms) so the picker can grey them out. A slot is "taken" if a
 * pending/confirmed booking already starts at that time.
 */
export function useAvailability(date: Date | null) {
  const supabase = getSupabaseBrowser();
  const [taken, setTaken] = useState<Set<number>>(new Set());
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!date) return;
    let active = true;
    setLoading(true);

    const start = new Date(date);
    start.setHours(0, 0, 0, 0);
    const end = new Date(date);
    end.setHours(23, 59, 59, 999);

    const SLOT_MS = 30 * 60 * 1000; // slots are 30 minutes apart

    // Align a timestamp down to the nearest :00 / :30 slot (local time).
    const floorToSlot = (t: number) => {
      const d = new Date(t);
      d.setSeconds(0, 0);
      d.setMinutes(d.getMinutes() < 30 ? 0 : 30);
      return d.getTime();
    };
    const blockInterval = (set: Set<number>, s: number, e: number) => {
      for (let t = floorToSlot(s); t < e; t += SLOT_MS) set.add(t);
    };

    const load = async () => {
      // Look back far enough that a long booking starting before this day
      // (or before a slot) still blocks the slots it overlaps.
      const lookback = new Date(start.getTime() - 12 * 60 * 60 * 1000);
      const { data } = await supabase
        .from("bookings")
        .select("scheduled_at, duration_min, status")
        .gte("scheduled_at", lookback.toISOString())
        .lte("scheduled_at", end.toISOString())
        .in("status", ["pending", "confirmed"]);
      if (!active) return;

      const set = new Set<number>();
      (data ?? []).forEach(
        (b: { scheduled_at: string; duration_min: number | null }) => {
          const bStart = new Date(b.scheduled_at).getTime();
          const bEnd = bStart + (b.duration_min ?? 60) * 60 * 1000;
          blockInterval(set, bStart, bEnd);
        },
      );

      // Merge the provider's external calendar (Skylight/Apple/Google) busy
      // times. Fails soft: if unconfigured/unreachable, nothing extra blocks.
      try {
        const y = start.getFullYear();
        const m = String(start.getMonth() + 1).padStart(2, "0");
        const d = String(start.getDate()).padStart(2, "0");
        const res = await fetch(`/api/busy?date=${y}-${m}-${d}`);
        if (res.ok && active) {
          const { busy } = (await res.json()) as {
            busy: { start: number; end: number }[];
          };
          busy?.forEach((iv) => blockInterval(set, iv.start, iv.end));
        }
      } catch {
        // ignore — calendar blackout is best-effort
      }

      if (!active) return;
      setTaken(set);
      setLoading(false);
    };

    load();

    // Stay live: if someone books while you're picking, the slot updates.
    const channel = supabase
      .channel(`availability-${start.toDateString()}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => load(),
      )
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, [supabase, date]);

  return { taken, loading };
}
