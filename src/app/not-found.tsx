import Link from "next/link";

export default function NotFound() {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center justify-center bg-joy-mesh px-6 text-center">
      <div className="text-7xl">🐕‍🦺</div>
      <h1 className="mt-4 font-display text-3xl font-extrabold text-ink">
        Lost the trail!
      </h1>
      <p className="mt-2 max-w-xs text-ink/60">
        This page wandered off chasing a squirrel. Let&apos;s get you home.
      </p>
      <Link
        href="/dashboard"
        className="mt-6 rounded-full bg-coral px-6 py-3 font-display font-bold text-white shadow-coral"
      >
        Back to home 🐾
      </Link>
    </main>
  );
}
