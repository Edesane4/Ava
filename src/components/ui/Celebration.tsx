"use client";

import { motion } from "framer-motion";

/**
 * Confetti burst of paws, bones & hearts for happy moments
 * (booking confirmed!). Pure CSS/SVG — no canvas dependency.
 */
const PIECES = ["🐾", "🦴", "💛", "🎉", "🐶", "💚", "💙", "⭐️", "🩷"];

export function Celebration({ count = 36 }: { count?: number }) {
  // Deterministic pseudo-random so SSR & client match (no Math.random at import).
  const rand = (seed: number) => {
    const x = Math.sin(seed * 99.13) * 10000;
    return x - Math.floor(x);
  };

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] overflow-hidden"
      aria-hidden="true"
    >
      {Array.from({ length: count }).map((_, i) => {
        const left = rand(i + 1) * 100;
        const delay = rand(i + 2) * 0.6;
        const duration = 2.2 + rand(i + 3) * 1.6;
        const drift = (rand(i + 4) - 0.5) * 120;
        const size = 18 + rand(i + 5) * 22;
        return (
          <motion.span
            key={i}
            initial={{ y: -60, x: 0, opacity: 0, rotate: 0 }}
            animate={{
              y: "110vh",
              x: drift,
              opacity: [0, 1, 1, 0],
              rotate: rand(i + 6) > 0.5 ? 360 : -360,
            }}
            transition={{
              duration,
              delay,
              ease: "easeIn",
              repeat: Infinity,
              repeatDelay: rand(i + 7) * 1.5,
            }}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: 0,
              fontSize: size,
            }}
          >
            {PIECES[i % PIECES.length]}
          </motion.span>
        );
      })}
    </div>
  );
}
