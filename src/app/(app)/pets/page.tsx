"use client";

import { useState } from "react";
import Image from "next/image";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { usePets } from "@/hooks/usePets";
import { PetForm } from "@/components/PetForm";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { PawLoader } from "@/components/ui/Loaders";
import { EmptyState } from "@/components/ui/EmptyState";
import { useToast } from "@/components/ui/Toast";
import { petAvatar } from "@/lib/utils";
import type { Pet } from "@/lib/types";

export default function PetsPage() {
  const { user } = useSession();
  const { pets, loading, savePet, removePet, uploadPhoto } = usePets(user?.id);
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Pet | null>(null);

  const openNew = () => {
    setEditing(null);
    setOpen(true);
  };
  const openEdit = (pet: Pet) => {
    setEditing(pet);
    setOpen(true);
  };

  const handleDelete = async (pet: Pet) => {
    if (!confirm(`Remove ${pet.name} from your pack?`)) return;
    try {
      await removePet(pet.id);
      toast.info(`${pet.name} was removed`);
    } catch {
      toast.error("Couldn't remove pet 🙈");
    }
  };

  return (
    <div className="space-y-5">
      <header className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            My Pets 🐶
          </h1>
          <p className="text-sm text-ink/60">Your furry family</p>
        </div>
        <Button variant="coral" size="sm" onClick={openNew}>
          <Plus className="h-4 w-4" /> Add
        </Button>
      </header>

      {loading ? (
        <PawLoader label="Rounding up your pets…" />
      ) : pets.length === 0 ? (
        <EmptyState
          emoji="🐾"
          title="No pets yet"
          subtitle="Add your first furry friend to start booking!"
          action={
            <Button variant="coral" size="sm" onClick={openNew}>
              <Plus className="h-4 w-4" /> Add a pet
            </Button>
          }
        />
      ) : (
        <div className="grid gap-3">
          {pets.map((pet) => (
            <Card key={pet.id} className="flex items-center gap-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-3xl border-2 border-white shadow">
                <Image
                  src={petAvatar(pet.name, pet.photo_url)}
                  alt={pet.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-extrabold text-ink">
                  {pet.name}
                </p>
                {pet.breed && (
                  <p className="text-sm text-ink/60">{pet.breed}</p>
                )}
                {pet.notes && (
                  <p className="mt-0.5 line-clamp-1 text-xs text-ink/45">
                    {pet.notes}
                  </p>
                )}
              </div>
              <div className="flex flex-col gap-1.5">
                <button
                  onClick={() => openEdit(pet)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-teal/10 text-teal-dark hover:bg-teal/20"
                  aria-label="Edit"
                >
                  <Pencil className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(pet)}
                  className="grid h-9 w-9 place-items-center rounded-full bg-coral/10 text-coral-dark hover:bg-coral/20"
                  aria-label="Delete"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      <PetForm
        open={open}
        pet={editing}
        onClose={() => setOpen(false)}
        onSave={savePet}
        onUpload={uploadPhoto}
      />
    </div>
  );
}
