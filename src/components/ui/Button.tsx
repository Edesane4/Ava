"use client";

import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

type Variant = "primary" | "teal" | "coral" | "sunny" | "ghost" | "outline";
type Size = "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary:
    "bg-coral text-white shadow-coral hover:bg-coral-dark focus-visible:ring-coral",
  teal: "bg-teal text-white shadow-glow hover:bg-teal-dark focus-visible:ring-teal",
  coral:
    "bg-coral text-white shadow-coral hover:bg-coral-dark focus-visible:ring-coral",
  sunny:
    "bg-sunny text-ink shadow-pop hover:bg-sunny-dark focus-visible:ring-sunny-dark",
  ghost: "bg-transparent text-ink hover:bg-black/5 focus-visible:ring-ink/30",
  outline:
    "bg-white/70 text-ink border-2 border-ink/10 hover:border-teal hover:bg-white focus-visible:ring-teal",
};

const sizes: Record<Size, string> = {
  sm: "px-4 py-2 text-sm",
  md: "px-6 py-3 text-base",
  lg: "px-8 py-4 text-lg",
};

interface ButtonProps extends Omit<HTMLMotionProps<"button">, "children"> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  fullWidth?: boolean;
  children?: React.ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      size = "md",
      loading = false,
      fullWidth = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.94 }}
        whileHover={{ scale: 1.03 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
        disabled={disabled || loading}
        className={cn(
          "inline-flex select-none items-center justify-center gap-2 rounded-full font-display font-bold tracking-wide",
          "outline-none ring-offset-2 transition-colors focus-visible:ring-4",
          "disabled:cursor-not-allowed disabled:opacity-60",
          variants[variant],
          sizes[size],
          fullWidth && "w-full",
          className,
        )}
        {...props}
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
        )}
        {children}
      </motion.button>
    );
  },
);
Button.displayName = "Button";
