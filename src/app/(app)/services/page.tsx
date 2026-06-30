"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { useServices } from "@/hooks/useServices";
import { ServiceCard } from "@/components/ServiceCard";
import { PawLoader } from "@/components/ui/Loaders";
import { useBookingStore } from "@/store/useBookingStore";
import { cn } from "@/lib/utils";
import type { Service, ServiceCategory } from "@/lib/types";

const TABS: { key: "all" | ServiceCategory; label: string; emoji: string }[] = [
  { key: "all", label: "All", emoji: "✨" },
  { key: "walk", label: "Walks", emoji: "🦮" },
  { key: "home_care", label: "Home Care", emoji: "🏡" },
];

function ServicesInner() {
  const { services, loading } = useServices();
  const params = useSearchParams();
  const router = useRouter();
  const setService = useBookingStore((s) => s.setService);
  const resetDraft = useBookingStore((s) => s.reset);

  const initial = (params.get("category") as "all" | ServiceCategory) || "all";
  const [tab, setTab] = useState<"all" | ServiceCategory>(initial);

  const filtered =
    tab === "all" ? services : services.filter((s) => s.category === tab);

  const handlePick = (service: Service) => {
    resetDraft();
    setService(service);
    router.push("/book");
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          Our Services 🐾
        </h1>
        <p className="text-sm text-ink/60">
          Pick a service to start booking — tap any card!
        </p>
      </header>

      {/* Tabs */}
      <div className="flex gap-2">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "flex-1 rounded-full px-4 py-2.5 font-display text-sm font-bold transition",
              tab === t.key
                ? "bg-coral text-white shadow-coral"
                : "bg-white/70 text-ink/60 hover:bg-white",
            )}
          >
            {t.emoji} {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <PawLoader />
      ) : (
        <motion.div layout className="space-y-3">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onSelect={handlePick}
            />
          ))}
        </motion.div>
      )}
    </div>
  );
}

export default function ServicesPage() {
  return (
    <Suspense fallback={<PawLoader />}>
      <ServicesInner />
    </Suspense>
  );
}
