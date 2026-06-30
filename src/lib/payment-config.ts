// ─────────────────────────────────────────────────────────────
// Payment handles shown to customers on the "Pay Now" screen.
// 👇 EDIT these to your own handles. No Stripe required — these are
// just your personal Venmo / Zelle / Apple Cash details + a QR link.
// ─────────────────────────────────────────────────────────────

export interface PayHandle {
  method: "venmo" | "zelle" | "apple_cash" | "cash";
  label: string;
  emoji: string;
  handle: string; // what the customer sends to
  /** Deep link that opens the app pre-filled (optional). */
  link?: (amountDollars: number, note: string) => string;
  /** Short, friendly how-to. */
  instructions: string;
  accent: string; // tailwind bg class for the card
}

export const PAY_HANDLES: PayHandle[] = [
  {
    method: "venmo",
    label: "Venmo",
    emoji: "🟦",
    handle: "@PawPal-Walks",
    link: (amount, note) =>
      `https://venmo.com/PawPal-Walks?txn=pay&amount=${amount}&note=${encodeURIComponent(
        note,
      )}`,
    instructions:
      "Tap to open Venmo with the amount pre-filled, or search @PawPal-Walks.",
    accent: "bg-[#3D95CE]/10",
  },
  {
    method: "zelle",
    label: "Zelle",
    emoji: "🟪",
    handle: "pawpal@example.com",
    instructions:
      "Open your bank app → Zelle → send to pawpal@example.com with the booking note.",
    accent: "bg-[#6D1ED4]/10",
  },
  {
    method: "apple_cash",
    label: "Apple Cash",
    emoji: "🍎",
    handle: "(555) 123-4567",
    instructions:
      "Open Messages → start a payment with (555) 123-4567 via Apple Cash.",
    accent: "bg-black/5",
  },
];

// The QR code encodes whatever string you want (a Venmo link works great).
export function payQrValue(amountDollars: number, note: string) {
  return `https://venmo.com/PawPal-Walks?txn=pay&amount=${amountDollars}&note=${encodeURIComponent(
    note,
  )}`;
}
