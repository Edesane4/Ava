"use client";

import { motion } from "framer-motion";
import { PawIcon } from "./PawIcon";
import { cn } from "@/lib/utils";

/** Bouncing paw loader for full-screen / section loading states. */
export function PawLoader({
  label = "Fetching the good boys…",
  className,
}: {
  label?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-4 py-16 text-ink/70",
        className,
      )}
    >
      <div className="flex gap-2">
        {[0, 1, 2].map((i) => (
          <motion.span
            key={i}
            animate={{ y: [0, -14, 0] }}
            transition={{
              duration: 0.8,
              repeat: Infinity,
              delay: i * 0.15,
              ease: "easeInOut",
            }}
          >
            <PawIcon
              className={cn(
                "h-7 w-7",
                i === 0 && "text-coral",
                i === 1 && "text-teal",
                i === 2 && "text-sunny-dark",
              )}
            />
          </motion.span>
        ))}
      </div>
      <p className="font-display text-sm font-semibold">{label}</p>
    </div>
  );
}

/** Skeleton shimmer block. */
export function Skeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-3xl bg-gradient-to-r from-black/5 via-black/10 to-black/5",
        className,
      )}
    />
  );
}
