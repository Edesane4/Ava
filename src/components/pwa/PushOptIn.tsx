"use client";

import { useEffect, useState } from "react";
import { Bell, BellRing } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useToast } from "@/components/ui/Toast";

// Convert a base64 VAPID public key to the Uint8Array the Push API wants.
function urlBase64ToUint8Array(base64String: string) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

/**
 * "Get push alerts on this device" card. Primarily for the provider so a
 * "🎉 New client!" notification reaches their phone even when the app is closed.
 * Requires NEXT_PUBLIC_VAPID_PUBLIC_KEY (see README → Push Notifications).
 */
export function PushOptIn() {
  const { user } = useSession();
  const supabase = getSupabaseBrowser();
  const toast = useToast();
  const [supported, setSupported] = useState(false);
  const [enabled, setEnabled] = useState(false);
  const [busy, setBusy] = useState(false);

  const vapidKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

  useEffect(() => {
    const ok =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      !!vapidKey;
    setSupported(ok);
    if (ok) {
      navigator.serviceWorker.ready
        .then((reg) => reg.pushManager.getSubscription())
        .then((sub) => setEnabled(!!sub))
        .catch(() => {});
    }
  }, [vapidKey]);

  const enable = async () => {
    if (!user || !vapidKey) return;
    setBusy(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== "granted") {
        toast.info("No worries — you can enable alerts later 🐾");
        return;
      }
      const reg = await navigator.serviceWorker.ready;
      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidKey),
      });
      // Store the subscription so the Edge Function can push to it.
      const { error } = await supabase.from("push_subscriptions").upsert(
        {
          user_id: user.id,
          subscription: sub.toJSON() as unknown as Record<string, unknown>,
        },
        { onConflict: "user_id,subscription" },
      );
      if (error) throw error;
      setEnabled(true);
      toast.success("Push alerts on! 🔔");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't enable 🙈");
    } finally {
      setBusy(false);
    }
  };

  // Nothing to show if push isn't configured/supported, or already enabled.
  if (!supported || enabled) return null;

  return (
    <Card className="flex items-center gap-3 bg-teal/10">
      <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-teal text-white">
        <Bell className="h-6 w-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-display font-bold text-ink">Get push alerts</p>
        <p className="text-sm text-ink/60">
          Be the first to know about new bookings.
        </p>
      </div>
      <Button size="sm" variant="teal" loading={busy} onClick={enable}>
        <BellRing className="h-4 w-4" /> On
      </Button>
    </Card>
  );
}
