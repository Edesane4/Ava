"use client";

import { createBrowserClient } from "@supabase/ssr";

/**
 * Browser Supabase client (for Client Components & hooks).
 * Uses the public anon key — safe to expose. RLS protects the data.
 */
export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}

// A singleton is handy for hooks so we don't recreate channels on every render.
let browserClient: ReturnType<typeof createClient> | null = null;
export function getSupabaseBrowser() {
  if (!browserClient) browserClient = createClient();
  return browserClient;
}
