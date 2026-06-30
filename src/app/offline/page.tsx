import Link from "next/link";

// Shown by the service worker when a navigation fails offline.
export const metadata = { title: "Offline" };

export default function OfflinePage() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-joy-mesh px-6 text-center">
      <div className="animate-bounce-soft text-7xl">🐾</div>
      <h1 className="mt-4 font-display text-2xl font-extrabold text-ink">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-xs text-ink/60">
        No internet right now — but your saved bookings are still here. We&apos;ll
        reconnect the moment you&apos;re back online!
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-full bg-coral px-6 py-3 font-display font-bold text-white shadow-coral"
      >
        Try again
      </Link>
    </main>
  );
}
