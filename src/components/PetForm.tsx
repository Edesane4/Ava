"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion } from "framer-motion";
import { Camera, Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input, Label, Textarea } from "@/components/ui/Field";
import { useToast } from "@/components/ui/Toast";
import { petAvatar } from "@/lib/utils";
import type { Pet } from "@/lib/types";

/** Modal sheet for adding / editing a pet, with photo upload. */
export function PetForm({
  open,
  pet,
  onClose,
  onSave,
  onUpload,
}: {
  open: boolean;
  pet?: Pet | null;
  onClose: () => void;
  onSave: (pet: Partial<Pet> & { name: string }) => Promise<void>;
  onUpload: (file: File) => Promise<string>;
}) {
  const toast = useToast();
  const fileRef = useRef<HTMLInputElement>(null);
  const [name, setName] = useState(pet?.name ?? "");
  const [breed, setBreed] = useState(pet?.breed ?? "");
  const [notes, setNotes] = useState(pet?.notes ?? "");
  const [photoUrl, setPhotoUrl] = useState<string | null>(pet?.photo_url ?? null);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const url = await onUpload(file);
      setPhotoUrl(url);
      toast.success("Adorable! 📸");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Upload failed 🙈");
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!name.trim()) return toast.error("Your pet needs a name! 🐾");
    setSaving(true);
    try {
      await onSave({
        id: pet?.id,
        name: name.trim(),
        breed: breed.trim() || null,
        notes: notes.trim() || null,
        photo_url: photoUrl,
      } as Partial<Pet> & { name: string });
      toast.success(pet ? "Updated! 🎉" : `${name} joined the pack! 🎉`);
      onClose();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Couldn't save 🙈");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-end justify-center bg-ink/40 backdrop-blur-sm sm:items-center"
          onClick={onClose}
        >
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 320, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-md rounded-t-5xl bg-cream p-6 shadow-2xl sm:rounded-5xl"
          >
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-display text-xl font-extrabold text-ink">
                {pet ? "Edit pet" : "Add a pet 🐶"}
              </h2>
              <button
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full text-ink/50 hover:bg-black/5"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Photo */}
            <div className="mb-5 flex justify-center">
              <button
                onClick={() => fileRef.current?.click()}
                className="relative h-28 w-28 overflow-hidden rounded-full border-4 border-white shadow-pop"
              >
                <Image
                  src={petAvatar(name, photoUrl)}
                  alt="Pet"
                  fill
                  className="object-cover"
                  unoptimized
                />
                <span className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-black/40 py-1 text-xs font-bold text-white">
                  {uploading ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Camera className="h-3.5 w-3.5" />
                  )}
                  {uploading ? "…" : "Photo"}
                </span>
              </button>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFile}
              />
            </div>

            <div className="space-y-3">
              <div>
                <Label htmlFor="pet-name">Name *</Label>
                <Input
                  id="pet-name"
                  placeholder="Biscuit"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pet-breed">Breed</Label>
                <Input
                  id="pet-breed"
                  placeholder="Golden Retriever"
                  value={breed}
                  onChange={(e) => setBreed(e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="pet-notes">Notes for the sitter</Label>
                <Textarea
                  id="pet-notes"
                  placeholder="Loves belly rubs, a little shy with other dogs, allergic to chicken…"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>

            <Button
              variant="coral"
              fullWidth
              size="lg"
              className="mt-5"
              loading={saving}
              onClick={handleSave}
            >
              {pet ? "Save changes" : "Add pet 🎉"}
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
