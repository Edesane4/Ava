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
        return !!draft.petId;
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
    "Select a pet 🐶",
    "Add an address 🏡",
    "Choose a payment method 💛",
  ][step];

  // ── Save the booking ────────────────────────────────────────
  const handleConfirm = async () => {
    if (!user || !draft.service || !draft.scheduledAt) return;
    setSubmitting(true);
    try {
      // Grab a friendly snapshot of the pet name.
      let petName: string | null = null;
      if (draft.petId) {
        const { data: pet } = await supabase
          .from("pets")
          .select("name")
          .eq("id", draft.petId)
          .single();
        petName = pet?.name ?? null;
      }

      const { data, error } = await supabase
        .from("bookings")
        .insert({
          customer_id: user.id,
          pet_id: draft.petId,
          service_id: draft.service.id,
          service_name: draft.service.name,
          pet_name: petName,
          price_cents: draft.service.price_cents,
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

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-24 z-30 px-4">
        <div className="mx-auto flex max-w-md gap-3">
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
