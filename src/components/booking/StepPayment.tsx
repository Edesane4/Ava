"use client";

import { QRCodeSVG } from "qrcode.react";
import { AnimatePresence, motion } from "framer-motion";
import { useBookingStore } from "@/store/useBookingStore";
import { PAY_HANDLES, payQrValue } from "@/lib/payment-config";
import { formatPrice, friendlyDateTime, cn } from "@/lib/utils";
import type { PaymentMethod } from "@/lib/types";

const OPTIONS: {
  method: PaymentMethod;
  label: string;
  emoji: string;
  hint: string;
}[] = [
  { method: "cash", label: "Cash", emoji: "💵", hint: "Pay in person" },
  { method: "venmo", label: "Venmo", emoji: "🟦", hint: "Pay later" },
  { method: "zelle", label: "Zelle", emoji: "🟪", hint: "Pay later" },
  { method: "apple_cash", label: "Apple Cash", emoji: "🍎", hint: "Pay later" },
  { method: "pay_now", label: "Pay Now", emoji: "⚡", hint: "Scan & send" },
];

/** Payment choice + a friendly review of the whole booking. */
export function StepPayment() {
  const draft = useBookingStore((s) => s.draft);
  const setPayment = useBookingStore((s) => s.setPayment);

  // Full price per pet: base × number of pets.
  const petCount = Math.max(1, (draft.petIds ?? []).length);
  const totalCents = (draft.service?.price_cents ?? 0) * petCount;
  const amountDollars = totalCents / 100;
  const note = `PawPal · ${draft.service?.name ?? "Pet care"}`;
  const selected = draft.paymentMethod;

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-ink">
          How would you like to pay? 💛
        </h2>
        <p className="text-sm text-ink/60">
          No pressure — pay now or pay later, your choice!
        </p>
      </div>

      {/* Review summary */}
      <div className="rounded-4xl bg-gradient-to-br from-sunny-light/70 to-teal-light/40 p-4">
        <div className="flex items-center justify-between">
          <span className="text-sm font-bold text-ink/60">
            {draft.service?.emoji} {draft.service?.name}
            {petCount > 1 && (
              <span className="text-ink/45">
                {" "}
                × {petCount} pets
              </span>
            )}
          </span>
          <span className="font-display text-lg font-extrabold text-ink">
            {formatPrice(totalCents)}
          </span>
        </div>
        {petCount > 1 && (
          <p className="mt-0.5 text-xs text-ink/45">
            {formatPrice(draft.service?.price_cents ?? 0)} each × {petCount} pets
          </p>
        )}
        {draft.scheduledAt && (
          <p className="mt-1 text-sm text-ink/60">
            📅 {friendlyDateTime(draft.scheduledAt)}
          </p>
        )}
      </div>

      {/* Method grid */}
      <div className="grid grid-cols-3 gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.method}
            onClick={() => setPayment(opt.method)}
            className={cn(
              "flex flex-col items-center gap-1 rounded-3xl border-2 bg-white/80 px-2 py-3 transition",
              selected === opt.method
                ? "border-coral shadow-coral"
                : "border-transparent hover:border-teal/40",
            )}
          >
            <span className="text-2xl">{opt.emoji}</span>
            <span className="font-display text-sm font-bold text-ink">
              {opt.label}
            </span>
            <span className="text-[10px] font-bold text-ink/45">
              {opt.hint}
            </span>
          </button>
        ))}
      </div>

      {/* Pay Now → QR + handles */}
      <AnimatePresence mode="wait">
        {selected === "pay_now" ? (
          <motion.div
            key="paynow"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="rounded-4xl border-2 border-teal/30 bg-white p-5 text-center">
              <p className="mb-3 font-display font-bold text-ink">
                Scan to pay {formatPrice(totalCents)} ⚡
              </p>
              <div className="mx-auto inline-block rounded-3xl bg-white p-3 shadow-pop">
                <QRCodeSVG
                  value={payQrValue(amountDollars, note)}
                  size={168}
                  bgColor="#ffffff"
                  fgColor="#2D2A45"
                  level="M"
                />
              </div>
              <div className="mt-4 space-y-2 text-left">
                {PAY_HANDLES.map((h) => (
                  <a
                    key={h.method}
                    href={h.link?.(amountDollars, note)}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(
                      "flex items-center gap-3 rounded-2xl p-3 transition hover:brightness-95",
                      h.accent,
                    )}
                  >
                    <span className="text-xl">{h.emoji}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-display text-sm font-bold text-ink">
                        {h.label}{" "}
                        <span className="text-ink/50">{h.handle}</span>
                      </p>
                      <p className="text-xs text-ink/55">{h.instructions}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="paylater"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="rounded-4xl bg-teal/10 p-4 text-center text-sm font-semibold text-teal-dark"
          >
            🐾 You&apos;ll settle up with{" "}
            {OPTIONS.find((o) => o.method === selected)?.label} after the visit.
            We&apos;ll send a friendly reminder!
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
