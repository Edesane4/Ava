"use client";

import { Clock } from "lucide-react";
import { Card } from "@/components/ui/Card";
import { formatPrice } from "@/lib/utils";
import type { Service } from "@/lib/types";

/** A colorful service tile. Optionally selectable (booking flow). */
export function ServiceCard({
  service,
  selected = false,
  onSelect,
}: {
  service: Service;
  selected?: boolean;
  onSelect?: (service: Service) => void;
}) {
  const accent =
    service.category === "walk"
      ? "from-teal-light/70 to-teal/20"
      : "from-coral-light/70 to-coral/20";

  return (
    <Card
      interactive={!!onSelect}
      onClick={() => onSelect?.(service)}
      className={`overflow-hidden ${
        selected ? "ring-4 ring-coral ring-offset-2" : ""
      }`}
    >
      <div className="flex items-start gap-4">
        <div
          className={`grid h-16 w-16 shrink-0 place-items-center rounded-3xl bg-gradient-to-br ${accent} text-4xl`}
        >
          {service.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="font-display text-lg font-extrabold leading-tight text-ink">
              {service.name}
            </h3>
            <span className="shrink-0 rounded-full bg-sunny px-3 py-1 font-display text-sm font-extrabold text-ink">
              {formatPrice(service.price_cents)}
            </span>
          </div>
          <p className="mt-1 text-sm text-ink/60">{service.description}</p>
          {service.duration_min && (
            <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-teal/10 px-2.5 py-1 text-xs font-bold text-teal-dark">
              <Clock className="h-3.5 w-3.5" />
              {service.duration_min} min
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}
