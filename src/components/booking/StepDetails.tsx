"use client";

import { MapPin } from "lucide-react";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { useBookingStore } from "@/store/useBookingStore";

/**
 * Address + special instructions. We keep the map optional & free:
 * a "use my location" button fills lat/lng via the browser Geolocation API,
 * and a link previews the address on Google/Apple Maps. No paid map SDK.
 */
export function StepDetails() {
  const draft = useBookingStore((s) => s.draft);
  const setLocation = useBookingStore((s) => s.setLocation);
  const setInstructions = useBookingStore((s) => s.setInstructions);

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((pos) => {
      setLocation(
        draft.address || "📍 Pinned current location",
        pos.coords.latitude,
        pos.coords.longitude,
      );
    });
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-ink">
          Where & anything special? 🏡
        </h2>
        <p className="text-sm text-ink/60">
          So we know where to go and how to make your pet comfy.
        </p>
      </div>

      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          placeholder="123 Bark Street, Apt 2"
          value={draft.address}
          onChange={(e) => setLocation(e.target.value, draft.lat, draft.lng)}
        />
        <div className="mt-2 flex items-center gap-3">
          <button
            onClick={useMyLocation}
            type="button"
            className="inline-flex items-center gap-1 rounded-full bg-teal/10 px-3 py-1.5 text-xs font-bold text-teal-dark hover:bg-teal/20"
          >
            <MapPin className="h-3.5 w-3.5" /> Use my location
          </button>
          {draft.address && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(
                draft.address,
              )}`}
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold text-ink/50 hover:text-ink"
            >
              Preview on map ↗
            </a>
          )}
        </div>
        {draft.lat != null && (
          <p className="mt-1 text-xs text-grass-dark">
            📍 Location pinned ({draft.lat.toFixed(4)}, {draft.lng?.toFixed(4)})
          </p>
        )}
      </div>

      <div>
        <Label htmlFor="instructions">Special instructions</Label>
        <Textarea
          id="instructions"
          placeholder="Leash is by the door, treats in the kitchen jar, gate code 1234…"
          value={draft.specialInstructions}
          onChange={(e) => setInstructions(e.target.value)}
        />
      </div>
    </div>
  );
}
