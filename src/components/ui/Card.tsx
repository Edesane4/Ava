"use client";

import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

interface CardProps extends HTMLMotionProps<"div"> {
  interactive?: boolean;
}

/** A rounded, soft, bouncy surface used everywhere. */
export function Card({
  className,
  interactive = false,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: "spring", stiffness: 260, damping: 22 }}
      whileHover={interactive ? { y: -4, scale: 1.01 } : undefined}
      whileTap={interactive ? { scale: 0.99 } : undefined}
      className={cn(
        "rounded-4xl border border-white/60 bg-white/90 p-5 shadow-[0_8px_30px_-12px_rgba(45,42,69,0.25)] backdrop-blur",
        interactive && "cursor-pointer",
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
