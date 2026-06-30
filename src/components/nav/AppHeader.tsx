"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Bell, LogOut } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { useNotifications } from "@/hooks/useNotifications";
import { PawIcon } from "@/components/ui/PawIcon";

/** Top bar: PawPal wordmark, greeting, notifications bell, sign-out. */
export function AppHeader() {
  const { user, profile, isProvider, signOut } = useSession();
  const { unreadCount } = useNotifications(user?.id);
  const router = useRouter();

  const firstName = profile?.full_name?.split(" ")[0] ?? "friend";

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 px-4 pt-[max(0.75rem,env(safe-area-inset-top))]">
      <div className="mx-auto flex max-w-md items-center justify-between rounded-full border border-white/60 bg-white/80 px-4 py-2.5 shadow-sm backdrop-blur">
        <Link href={isProvider ? "/provider" : "/dashboard"} className="flex items-center gap-2">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-coral text-white">
            <PawIcon className="h-5 w-5" />
          </span>
          <div className="leading-tight">
            <p className="font-display text-sm font-extrabold text-ink">
              PawPal
            </p>
            <p className="text-[11px] text-ink/50">
              Hi, {firstName}! {isProvider ? "🦴" : "🐾"}
            </p>
          </div>
        </Link>

        <div className="flex items-center gap-1">
          <Link
            href="/notifications"
            className="relative grid h-9 w-9 place-items-center rounded-full text-ink/60 hover:bg-black/5"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <span className="absolute right-1 top-1 grid h-4 min-w-4 place-items-center rounded-full bg-coral px-1 text-[10px] font-bold text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </Link>
          <button
            onClick={handleSignOut}
            className="grid h-9 w-9 place-items-center rounded-full text-ink/60 hover:bg-black/5"
            aria-label="Sign out"
          >
            <LogOut className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
