"use client";

import { useCallback, useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Pet } from "@/lib/types";

/** The signed-in user's pets, with add/update/remove helpers. */
export function usePets(userId?: string | null) {
  const supabase = getSupabaseBrowser();
  const [pets, setPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPets = useCallback(async () => {
    if (!userId) return;
    const { data } = await supabase
      .from("pets")
      .select("*")
      .eq("owner_id", userId)
      .order("created_at", { ascending: true });
    setPets((data as Pet[]) ?? []);
    setLoading(false);
  }, [supabase, userId]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const savePet = useCallback(
    async (pet: Partial<Pet> & { name: string }) => {
      if (!userId) throw new Error("Not signed in");
      if (pet.id) {
        const { error } = await supabase
          .from("pets")
          .update({
            name: pet.name,
            species: pet.species,
            breed: pet.breed,
            notes: pet.notes,
            photo_url: pet.photo_url,
          })
          .eq("id", pet.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("pets").insert({
          owner_id: userId,
          name: pet.name,
          species: pet.species ?? "dog",
          breed: pet.breed,
          notes: pet.notes,
          photo_url: pet.photo_url,
        });
        if (error) throw error;
      }
      await fetchPets();
    },
    [supabase, userId, fetchPets],
  );

  const removePet = useCallback(
    async (id: string) => {
      const { error } = await supabase.from("pets").delete().eq("id", id);
      if (error) throw error;
      await fetchPets();
    },
    [supabase, fetchPets],
  );

  /** Upload a photo to the `pet-photos` bucket → returns a public URL. */
  const uploadPhoto = useCallback(
    async (file: File) => {
      if (!userId) throw new Error("Not signed in");
      const ext = file.name.split(".").pop() ?? "jpg";
      // Folder must start with the user's id (see Storage RLS policy).
      const path = `${userId}/${crypto.randomUUID()}.${ext}`;
      const { error } = await supabase.storage
        .from("pet-photos")
        .upload(path, file, { upsert: true });
      if (error) throw error;
      const { data } = supabase.storage.from("pet-photos").getPublicUrl(path);
      return data.publicUrl;
    },
    [supabase, userId],
  );

  return { pets, loading, savePet, removePet, uploadPhoto, refetch: fetchPets };
}
