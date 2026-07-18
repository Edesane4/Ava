"use client";

import { useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { motion } from "framer-motion";
import { useSession } from "@/components/providers/SessionProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { Card } from "@/components/ui/Card";
import { PawLoader } from "@/components/ui/Loaders";
import { EmptyState } from "@/components/ui/EmptyState";
import { PushOptIn } from "@/components/pwa/PushOptIn";
import { cn, toSafeDate } from "@/lib/utils";

export default function NotificationsPage() {
  const { user } = useSession();
  const { items, loading, unreadCount, markAllRead } = useNotifications(
    user?.id,
  );

  // Mark everything read shortly after viewing.
  useEffect(() => {
    if (unreadCount > 0) {
      const t = setTimeout(() => markAllRead(), 1200);
      return () => clearTimeout(t);
    }
  }, [unreadCount, markAllRead]);

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Notifications 🔔
        </h1>
        <p className="text-sm text-ink/60">
          {unreadCount > 0 ? `${unreadCount} new` : "You're all caught up!"}
        </p>
      </header>

      <PushOptIn />

      {loading ? (
        <PawLoader />
      ) : items.length === 0 ? (
        <EmptyState
          emoji="📭"
          title="No notifications yet"
          subtitle="New bookings and updates will appear here."
        />
      ) : (
        <div className="space-y-2.5">
          {items.map((n, i) => (
            <motion.div
              key={n.id}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03 }}
            >
              <Card
                className={cn(
                  "flex items-start gap-3 !p-4",
                  !n.read && "ring-2 ring-coral/30",
                )}
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-sunny-light text-xl">
                  {n.read ? "🐾" : "🎉"}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-display font-bold text-ink">{n.title}</p>
                  {n.body && <p className="text-sm text-ink/60">{n.body}</p>}
                  <p className="mt-0.5 text-xs text-ink/35">
                    {formatDistanceToNow(toSafeDate(n.created_at), {
                      addSuffix: true,
                    })}
                  </p>
                </div>
                {!n.read && (
                  <span className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full bg-coral" />
                )}
              </Card>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
