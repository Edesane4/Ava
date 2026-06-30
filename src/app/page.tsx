"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/Button";
import { PawConfettiBg, PawIcon } from "@/components/ui/PawIcon";

// ─────────────────────────────────────────────────────────────
// Welcome / Onboarding — a joyful 3-slide intro carousel.
// ─────────────────────────────────────────────────────────────

const SLIDES = [
  {
    emoji: "🦮",
    title: "Happy walks, happy tails",
    body: "Book 30, 45 or 60-minute neighborhood adventures for your best friend.",
    color: "from-sunny-light to-teal-light",
  },
  {
    emoji: "🏡",
    title: "Loving home care",
    body: "Drop-in visits, pet sitting & cozy overnights — all in your pet's happy place.",
    color: "from-teal-light to-coral-light",
  },
  {
    emoji: "🎉",
    title: "Book in a few taps",
    body: "Pick a time, choose your pup, and pay however you like. Easy peasy!",
    color: "from-coral-light to-sunny-light",
  },
];

export default function WelcomePage() {
  const [index, setIndex] = useState(0);
  const router = useRouter();
  const last = index === SLIDES.length - 1;
  const slide = SLIDES[index];

  const advance = () => {
    if (last) router.push("/login");
    else setIndex((i) => i + 1);
  };

  return (
    <main className="joy-bg relative flex min-h-[100dvh] flex-col overflow-hidden">
      <PawConfettiBg />

      {/* Brand */}
      <div className="relative z-10 flex items-center justify-center gap-2 pt-[max(2rem,env(safe-area-inset-top))]">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-coral text-white shadow-coral">
          <PawIcon className="h-6 w-6" />
        </span>
        <span className="font-display text-2xl font-extrabold text-ink">
          PawPal
        </span>
      </div>

      {/* Slides */}
      <div className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 text-center">
        <AnimatePresence mode="wait">
          <motion.div
            key={index}
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            transition={{ type: "spring", stiffness: 260, damping: 22 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{ y: [0, -16, 0], rotate: [-3, 3, -3] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
              className={`mb-8 grid h-44 w-44 place-items-center rounded-[2.5rem] bg-gradient-to-br ${slide.color} text-8xl shadow-pop`}
            >
              {slide.emoji}
            </motion.div>
            <h1 className="mb-3 max-w-xs font-display text-3xl font-extrabold leading-tight text-ink">
              {slide.title}
            </h1>
            <p className="max-w-xs text-base text-ink/70">{slide.body}</p>
          </motion.div>
        </AnimatePresence>

        {/* Dots */}
        <div className="mt-10 flex gap-2">
          {SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              aria-label={`Go to slide ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                i === index ? "w-8 bg-coral" : "w-2.5 bg-ink/20"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="relative z-10 flex flex-col items-center gap-3 px-6 pb-[max(2rem,env(safe-area-inset-bottom))]">
        <Button size="lg" fullWidth variant="coral" onClick={advance}>
          {last ? "Let's go! 🐾" : "Next"}
        </Button>
        <Link
          href="/login"
          className="font-display text-sm font-bold text-ink/60 hover:text-ink"
        >
          {last ? "I already have an account" : "Skip"}
        </Link>
      </div>
    </main>
  );
}
