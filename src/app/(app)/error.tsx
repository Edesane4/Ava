"use client";

import { Button } from "@/components/ui/Button";

export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 px-6 py-24 text-center">
      <div className="text-6xl">🙈</div>
      <h2 className="font-display text-xl font-extrabold text-ink">
        Oops, a little hiccup!
      </h2>
      <p className="max-w-xs text-sm text-ink/60">
        Something went sideways. Give it another sniff — er, try.
      </p>
      <Button variant="coral" onClick={reset} className="mt-2">
        Try again 🐾
      </Button>
    </div>
  );
}
