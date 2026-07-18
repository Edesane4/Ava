"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { BookingDraft, PaymentMethod, Service } from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// Booking flow state (Zustand + localStorage persistence).
// Survives refreshes & offline, so a half-finished booking isn't lost.
// ─────────────────────────────────────────────────────────────

const emptyDraft: BookingDraft = {
  service: null,
  scheduledAt: null,
  petIds: [],
  address: "",
  lat: null,
  lng: null,
  specialInstructions: "",
  paymentMethod: "cash",
};

interface BookingState {
  step: number; // 0..4
  draft: BookingDraft;
  setStep: (step: number) => void;
  next: () => void;
  back: () => void;
  setService: (service: Service) => void;
  setSchedule: (iso: string) => void;
  togglePet: (petId: string) => void;
  setLocation: (address: string, lat?: number | null, lng?: number | null) => void;
  setInstructions: (text: string) => void;
  setPayment: (method: PaymentMethod) => void;
  reset: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      step: 0,
      draft: emptyDraft,
      setStep: (step) => set({ step }),
      next: () => set((s) => ({ step: Math.min(s.step + 1, 4) })),
      back: () => set((s) => ({ step: Math.max(s.step - 1, 0) })),
      setService: (service) =>
        set((s) => ({ draft: { ...s.draft, service } })),
      setSchedule: (iso) =>
        set((s) => ({ draft: { ...s.draft, scheduledAt: iso } })),
      togglePet: (petId) =>
        set((s) => {
          const current = s.draft.petIds ?? [];
          const petIds = current.includes(petId)
            ? current.filter((id) => id !== petId)
            : [...current, petId];
          return { draft: { ...s.draft, petIds } };
        }),
      setLocation: (address, lat = null, lng = null) =>
        set((s) => ({ draft: { ...s.draft, address, lat, lng } })),
      setInstructions: (specialInstructions) =>
        set((s) => ({ draft: { ...s.draft, specialInstructions } })),
      setPayment: (paymentMethod) =>
        set((s) => ({ draft: { ...s.draft, paymentMethod } })),
      reset: () => set({ step: 0, draft: emptyDraft }),
    }),
    // v2: draft shape changed (petId → petIds). New key ignores stale drafts.
    { name: "pawpal-booking-draft-v2" },
  ),
);
