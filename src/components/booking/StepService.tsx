"use client";

import { useServices } from "@/hooks/useServices";
import { ServiceCard } from "@/components/ServiceCard";
import { PawLoader } from "@/components/ui/Loaders";
import { useBookingStore } from "@/store/useBookingStore";

/** Pick (or confirm) the service for this booking. */
export function StepService() {
  const { services, loading } = useServices();
  const draft = useBookingStore((s) => s.draft);
  const setService = useBookingStore((s) => s.setService);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-ink">
          Choose a service ✨
        </h2>
        <p className="text-sm text-ink/60">What can we do for your pet today?</p>
      </div>

      {loading ? (
        <PawLoader />
      ) : (
        <div className="space-y-3">
          {services.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              selected={draft.service?.id === service.id}
              onSelect={setService}
            />
          ))}
        </div>
      )}
    </div>
  );
}
