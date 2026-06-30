"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CalendarHeart, Dog, Home, PlusCircle, Sparkles } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { cn } from "@/lib/utils";

interface NavItem {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}

const customerNav: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/services", label: "Services", icon: Sparkles },
  { href: "/book", label: "Book", icon: PlusCircle },
  { href: "/pets", label: "Pets", icon: Dog },
  { href: "/bookings", label: "Bookings", icon: CalendarHeart },
];

const providerNav: NavItem[] = [
  { href: "/provider", label: "Jobs", icon: Home },
  { href: "/provider/calendar", label: "Calendar", icon: CalendarHeart },
  { href: "/services", label: "Services", icon: Sparkles },
  { href: "/notifications", label: "Alerts", icon: Dog },
];

/** Sticky, bouncy bottom tab bar (mobile-first, also shown on desktop). */
export function BottomNav() {
  const pathname = usePathname();
  const { isProvider } = useSession();
  const items = isProvider ? providerNav : customerNav;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto max-w-md px-3 pb-3">
        <div className="flex items-center justify-around rounded-full border border-white/70 bg-white/90 px-2 py-2 shadow-[0_10px_30px_-10px_rgba(45,42,69,0.35)] backdrop-blur">
          {items.map((item) => {
            const active =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                item.href !== "/provider" &&
                pathname.startsWith(item.href));
            const isBookCta = item.href === "/book";
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="relative flex flex-1 flex-col items-center gap-0.5 py-1"
              >
                {isBookCta ? (
                  <motion.span
                    whileTap={{ scale: 0.9 }}
                    className="grid h-12 w-12 -translate-y-3 place-items-center rounded-full bg-coral text-white shadow-coral"
                  >
                    <Icon className="h-7 w-7" />
                  </motion.span>
                ) : (
                  <span
                    className={cn(
                      "grid h-9 w-9 place-items-center rounded-full transition-colors",
                      active ? "bg-teal/15 text-teal-dark" : "text-ink/45",
                    )}
                  >
                    <Icon className="h-6 w-6" />
                  </span>
                )}
                <span
                  className={cn(
                    "text-[10px] font-bold",
                    active ? "text-teal-dark" : "text-ink/45",
                    isBookCta && "text-coral",
                  )}
                >
                  {item.label}
                </span>
                {active && !isBookCta && (
                  <motion.span
                    layoutId="nav-dot"
                    className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-coral"
                  />
                )}
              </Link>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
