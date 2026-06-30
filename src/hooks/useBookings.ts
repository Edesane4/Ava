"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Booking } from "@/lib/types";

/**
 * Live-updating bookings list. Pass `mode`:
 *  - "mine"     → the signed-in customer's bookings
 *  - "provider" → ALL bookings (provider dashboard)
 * Subscribes to Supabase Realtime so the list updates instantly.
 */
export function useBookings(mode: "mine" | "provider", userId?: string | null) {
  const supabase = getSupabaseBrowser();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    let query = supabase
      .from("bookings")
      .select("*, pets(*), profiles:customer_id(*)")
      .order("scheduled_at", { ascending: true });

    if (mode === "mine" && userId) query = query.eq("customer_id", userId);

    const { data, error } = await query;
    if (error) setError(error.message);
    else setBookings((data as Booking[]) ?? []);
    setLoading(false);
  }, [supabase, mode, userId]);

  useEffect(() => {
    fetchBookings();

    const channel = supabase
      .channel(`bookings-${mode}-${userId ?? "all"}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "bookings" },
        () => fetchBookings(), // simplest correct approach: refetch on any change
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, mode, userId, fetchBookings]);

  return { bookings, loading, error, refetch: fetchBookings };
}
