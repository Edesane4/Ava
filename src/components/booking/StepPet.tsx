"use client";

import { useState } from "react";
import Image from "next/image";
import { Check, Plus } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { usePets } from "@/hooks/usePets";
import { PetForm } from "@/components/PetForm";
import { Button } from "@/components/ui/Button";
import { PawLoader } from "@/components/ui/Loaders";
import { useBookingStore } from "@/store/useBookingStore";
import { petAvatar, cn } from "@/lib/utils";

/** Choose which pet the booking is for (or add a new one inline). */
export function StepPet() {
  const { user } = useSession();
  const { pets, loading, savePet, uploadPhoto } = usePets(user?.id);
  const draft = useBookingStore((s) => s.draft);
  const setPet = useBookingStore((s) => s.setPet);
  const [formOpen, setFormOpen] = useState(false);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-xl font-extrabold text-ink">
          Who&apos;s the lucky pup? 🐶
        </h2>
        <p className="text-sm text-ink/60">Select a pet for this visit.</p>
      </div>

      {loading ? (
        <PawLoader label="Finding your pets…" />
      ) : (
        <div className="grid grid-cols-2 gap-3">
          {pets.map((pet) => {
            const selected = draft.petId === pet.id;
            return (
              <button
                key={pet.id}
                onClick={() => setPet(pet.id)}
                className={cn(
                  "relative flex flex-col items-center gap-2 rounded-4xl border-2 bg-white/80 p-4 transition",
                  selected
                    ? "border-coral shadow-coral"
                    : "border-transparent hover:border-teal/40",
                )}
              >
                {selected && (
                  <span className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-coral text-white">
                    <Check className="h-4 w-4" />
                  </span>
                )}
                <div className="relative h-20 w-20 overflow-hidden rounded-full border-2 border-white shadow">
                  <Image
                    src={petAvatar(pet.name, pet.photo_url)}
                    alt={pet.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <span className="font-display font-extrabold text-ink">
                  {pet.name}
                </span>
                {pet.breed && (
                  <span className="-mt-1.5 text-xs text-ink/50">
                    {pet.breed}
                  </span>
                )}
              </button>
            );
          })}

          {/* Add new */}
          <button
            onClick={() => setFormOpen(true)}
            className="flex min-h-[10rem] flex-col items-center justify-center gap-2 rounded-4xl border-2 border-dashed border-ink/15 text-ink/50 transition hover:border-coral hover:text-coral"
          >
            <span className="grid h-12 w-12 place-items-center rounded-full bg-sunny-light">
              <Plus className="h-6 w-6" />
            </span>
            <span className="font-display text-sm font-bold">Add pet</span>
          </button>
        </div>
      )}

      {pets.length === 0 && !loading && (
        <Button variant="coral" fullWidth onClick={() => setFormOpen(true)}>
          <Plus className="h-4 w-4" /> Add your first pet
        </Button>
      )}

      <PetForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={async (pet) => {
          await savePet(pet);
        }}
        onUpload={uploadPhoto}
      />
    </div>
  );
}
