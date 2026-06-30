"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

/** Friendly empty state with a big emoji, message, and optional action. */
export function EmptyState({
  emoji = "🐶",
  title,
  subtitle,
  action,
  className,
}: {
  emoji?: string;
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-4xl border-2 border-dashed border-ink/10 bg-white/50 px-6 py-12 text-center",
        className,
      )}
    >
      <motion.div
        animate={{ rotate: [-6, 6, -6] }}
        transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
        className="text-6xl"
      >
        {emoji}
      </motion.div>
      <h3 className="font-display text-xl font-bold text-ink">{title}</h3>
      {subtitle && (
        <p className="max-w-xs text-sm text-ink/60">{subtitle}</p>
      )}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
