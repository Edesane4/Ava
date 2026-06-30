"use client";

import { useMemo, useState } from "react";
import { addDays, format, isSameDay } from "date-fns";
import { motion } from "framer-motion";
import { useAvailability } from "@/hooks/useAvailability";
import { buildTimeSlots, isPast, cn } from "@/lib/utils";
import { useBookingStore } from "@/store/useBookingStore";

/** Date strip (next 14 days) + live time-slot grid. */
export function StepSchedule() {
  const draft = useBookingStore((s) => s.draft);
  const setSchedule = useBookingStore((s) => s.setSchedule);

  const initial = draft.scheduledAt ? new Date(draft.scheduledAt) : null;
  const [selectedDay, setSelectedDay] = useState<Date>(
    initial ?? new Date(),
  );

  const days = useMemo(
    () => Array.from({ length: 14 }, (_, i) => addDays(new Date(), i)),
    [],
  );
  const slots = useMemo(() => buildTimeSlots(selectedDay), [selectedDay]);
  const { taken, loading } = useAvailability(selectedDay);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-ink">
          Pick a day & time 📅
        </h2>
        <p className="text-sm text-ink/60">
          Live availability — greyed slots are already booked.
        </p>
      </div>

      {/* Day strip */}
      <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 pb-1">
        {days.map((day) => {
          const active = isSameDay(day, selectedDay);
          return (
            <button
              key={day.toISOString()}
              onClick={() => setSelectedDay(day)}
              className={cn(
                "flex min-w-[3.5rem] flex-col items-center rounded-3xl px-3 py-2.5 transition",
                active
                  ? "bg-coral text-white shadow-coral"
                  : "bg-white/70 text-ink/70 hover:bg-white",
              )}
            >
              <span className="text-[10px] font-bold uppercase opacity-80">
                {format(day, "EEE")}
              </span>
              <span className="font-display text-xl font-extrabold">
                {format(day, "d")}
              </span>
              <span className="text-[10px] font-bold opacity-70">
                {format(day, "MMM")}
              </span>
            </button>
          );
        })}
      </div>

      {/* Slots */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {slots.map((slot) => {
          const past = isPast(slot);
          const isTaken = taken.has(slot.getTime());
          const disabled = past || isTaken;
          const selected =
            draft.scheduledAt &&
            new Date(draft.scheduledAt).getTime() === slot.getTime();
          return (
            <motion.button
              key={slot.toISOString()}
              whileTap={disabled ? {} : { scale: 0.93 }}
              disabled={disabled}
              onClick={() => setSchedule(slot.toISOString())}
              className={cn(
                "rounded-2xl py-2.5 text-sm font-bold transition",
                selected
                  ? "bg-teal text-white shadow-glow"
                  : disabled
                    ? "cursor-not-allowed bg-black/5 text-ink/25 line-through"
                    : "bg-white/80 text-ink hover:bg-teal/10",
              )}
            >
              {format(slot, "h:mm a")}
            </motion.button>
          );
        })}
      </div>

      {loading && (
        <p className="text-center text-xs text-ink/40">
          Checking availability… 🐾
        </p>
      )}
    </div>
  );
}
