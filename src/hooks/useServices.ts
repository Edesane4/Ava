"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import type { Service } from "@/lib/types";

/** Fetch the active service menu, ordered for display. */
export function useServices() {
  const supabase = getSupabaseBrowser();
  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    (async () => {
      const { data } = await supabase
        .from("services")
        .select("*")
        .eq("active", true)
        .order("sort_order", { ascending: true });
      if (active) {
        setServices((data as Service[]) ?? []);
        setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [supabase]);

  return { services, loading };
}
