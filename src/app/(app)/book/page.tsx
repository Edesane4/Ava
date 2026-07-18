"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useBookingStore } from "@/store/useBookingStore";
import { useToast } from "@/components/ui/Toast";
import { Button } from "@/components/ui/Button";
import { Stepper } from "@/components/booking/Stepper";
import { StepService } from "@/components/booking/StepService";
import { StepSchedule } from "@/components/booking/StepSchedule";
import { StepPet } from "@/components/booking/StepPet";
import { StepDetails } from "@/components/booking/StepDetails";
import { StepPayment } from "@/components/booking/StepPayment";

export default function BookPage() {
  const router = useRouter();
  const { user } = useSession();
  const supabase = getSupabaseBrowser();
  const toast = useToast();

  const { step, draft, next, back, reset } = useBookingStore();
  const [submitting, setSubmitting] = useState(false);

  // ── Per-step validation gates ───────────────────────────────
  const canAdvance = (() => {
    switch (step) {
      case 0:
        return !!draft.service;
      case 1:
        return !!draft.scheduledAt;
      case 2:
        return (draft.petIds ?? []).length > 0;
      case 3:
        return draft.address.trim().length > 2;
      case 4:
        return !!draft.paymentMethod;
      default:
        return false;
    }
  })();

  const stepValidationMessage = [
    "Pick a service first 🐾",
    "Choose a day & time 📅",
    "Select at least one pet 🐾",
    "Add an address 🏡",
    "Choose a payment method 💛",
  ][step];

  // ── Save the booking ────────────────────────────────────────
  const handleConfirm = async () => {
    if (!user || !draft.service || !draft.scheduledAt) return;
    setSubmitting(true);
    try {
      const petIds = draft.petIds ?? [];

      // Grab friendly name snapshots for every selected pet.
      let petNames: string[] = [];
      if (petIds.length) {
        const { data: pets } = await supabase
          .from("pets")
          .select("id, name")
          .in("id", petIds);
        // Preserve the order the customer selected them in.
        petNames = petIds
          .map((id) => pets?.find((p) => p.id === id)?.name)
          .filter((n): n is string => !!n);
      }

      // Full price per pet: base × number of pets.
      const petCount = Math.max(1, petIds.length);
      const totalCents = draft.service.price_cents * petCount;

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          pet_id: petIds[0] ?? null, // primary pet (kept for existing displays)
          pet_ids: petIds,
          service_id: draft.service.id,
          service_name: draft.service.name,
          pet_name: petNames.join(" & ") || null,
          price_cents: totalCents,
          scheduled_at: draft.scheduledAt,
          duration_min: draft.service.duration_min,
          address: draft.address,
          lat: draft.lat,
          lng: draft.lng,
          special_instructions: draft.specialInstructions || null,
          payment_method: draft.paymentMethod,
          payment_status: "unpaid",
          status: "pending",
        })
        .select("id")
        .single();

      if (error) throw error;

      // Fire-and-forget: notify the provider (push + Google Calendar).
      // The DB trigger already inserted an in-app notification; this adds push.
      fetch("/api/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingId: data.id }),
      }).catch(() => {});

      reset();
      router.replace(`/book/confirmed/${data.id}`);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Couldn't book — try again 🙈",
      );
      setSubmitting(false);
    }
  };

  const onPrimary = () => {
    if (!canAdvance) {
      toast.info(stepValidationMessage);
      return;
    }
    if (step === 4) handleConfirm();
    else next();
  };

  const steps = [
    <StepService key="s0" />,
    <StepSchedule key="s1" />,
    <StepPet key="s2" />,
    <StepDetails key="s3" />,
    <StepPayment key="s4" />,
  ];

  return (
    <div className="space-y-6">
      <Stepper step={step} />

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 24 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -24 }}
          transition={{ type: "spring", stiffness: 280, damping: 26 }}
        >
          {steps[step]}
        </motion.div>
      </AnimatePresence>

      {/* Spacer so the last field never hides behind the docked action bar. */}
      <div aria-hidden className="h-24" />

      {/* Docked action bar — solid pill pinned above the tab bar so Continue
          stays visible & tappable no matter how far you scroll. */}
      <div className="fixed inset-x-0 bottom-[calc(5rem+env(safe-area-inset-bottom))] z-40 px-4">
        <div className="mx-auto flex max-w-md gap-3 rounded-full border border-white/60 bg-white/90 p-2 shadow-[0_12px_34px_-10px_rgba(45,42,69,0.45)] backdrop-blur">
          {step > 0 && (
            <Button
              variant="outline"
              size="lg"
              onClick={back}
              className="!px-5"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </Button>
          )}
          <Button
            variant={step === 4 ? "teal" : "coral"}
            size="lg"
            fullWidth
            loading={submitting}
            onClick={onPrimary}
            className={!canAdvance ? "opacity-60" : ""}
          >
            {step === 4 ? (
              "Confirm Booking 🎉"
            ) : (
              <>
                Continue <ArrowRight className="h-5 w-5" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
