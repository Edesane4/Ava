import { type NextRequest } from "next/server";
import { updateSession } from "@/lib/supabase/middleware";

// Keep the Supabase session fresh + guard protected routes on every request.
export async function middleware(request: NextRequest) {
  return await updateSession(request);
}

export const config = {
  matcher: [
    // Run on everything except static assets, the manifest, the service worker,
    // and image files (so the PWA shell stays fast & cacheable).
    "/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|illustrations|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
