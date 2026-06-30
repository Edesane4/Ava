"use client";

import { motion } from "framer-motion";
import { Check } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = ["Service", "Time", "Pet", "Details", "Pay"];

/** Bouncy progress indicator across the booking steps. */
export function Stepper({ step }: { step: number }) {
  return (
    <div className="flex items-center justify-between px-1">
      {STEPS.map((label, i) => {
        const done = i < step;
        const active = i === step;
        return (
          <div key={label} className="flex flex-1 flex-col items-center">
            <div className="flex w-full items-center">
              {i > 0 && (
                <div
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i <= step ? "bg-coral" : "bg-ink/10",
                  )}
                />
              )}
              <motion.div
                animate={active ? { scale: [1, 1.15, 1] } : {}}
                transition={{ repeat: active ? Infinity : 0, duration: 1.4 }}
                className={cn(
                  "grid h-8 w-8 shrink-0 place-items-center rounded-full font-display text-sm font-bold transition-colors",
                  done && "bg-grass text-white",
                  active && "bg-coral text-white shadow-coral",
                  !done && !active && "bg-white text-ink/40",
                )}
              >
                {done ? <Check className="h-4 w-4" /> : i + 1}
              </motion.div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-1 flex-1 rounded-full transition-colors",
                    i < step ? "bg-coral" : "bg-ink/10",
                  )}
                />
              )}
            </div>
            <span
              className={cn(
                "mt-1 text-[10px] font-bold",
                active ? "text-coral" : "text-ink/40",
              )}
            >
              {label}
            </span>
          </div>
        );
      })}
    </div>
  );
}
