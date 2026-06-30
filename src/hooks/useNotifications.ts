"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { AppNotification } from "@/lib/types";

/** Live notifications feed for the signed-in user (provider or customer). */
export function useNotifications(userId?: string | null) {
  const supabase = getSupabaseBrowser();
  const [items, setItems] = useState<AppNotification[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(50);
    setItems((data as AppNotification[]) ?? []);
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    fetchItems();
    if (!userId) return;

    const channel = supabase
      .channel(`notifications-${userId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "notifications",
          filter: `user_id=eq.${userId}`,
        },
        () => fetchItems(),
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, userId, fetchItems]);

  const unreadCount = items.filter((n) => !n.read).length;

  const markAllRead = useCallback(async () => {
    if (!userId) return;
    await supabase
      .from("notifications")
      .update({ read: true })
      .eq("user_id", userId)
      .eq("read", false);
    fetchItems();
  }, [supabase, userId, fetchItems]);

  return { items, loading, unreadCount, markAllRead, refetch: fetchItems };
}
