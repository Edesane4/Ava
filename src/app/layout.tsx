import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import "./globals.css";
import { SessionProvider } from "@/components/providers/SessionProvider";
import { ToastProvider } from "@/components/ui/Toast";
import { ServiceWorkerRegister } from "@/components/pwa/ServiceWorkerRegister";
import { OfflineBanner } from "@/components/pwa/OfflineBanner";
import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/lib/types";

// Rounded, friendly display + body fonts (self-hosted by Next — free & fast).
const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});
const nunito = Nunito({
  subsets: ["latin"],
  variable: "--font-nunito",
  display: "swap",
});

export const metadata: Metadata = {
  applicationName: "PawPal Pet Care",
  title: {
    default: "PawPal Pet Care 🐾",
    template: "%s · PawPal",
  },
  description:
    "Joyful dog walking & home pet care booking. Happy pets, happy you!",
  manifest: "/manifest.json",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "PawPal",
  },
  formatDetection: { telephone: false },
  icons: {
    icon: "/icons/icon-192.png",
    apple: "/icons/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#00D4C5",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Pre-load the session on the server so there's no auth flicker.
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: Profile | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    profile = data as Profile | null;
  }

  return (
    <html lang="en" className={`${fredoka.variable} ${nunito.variable}`}>
      <body>
        <SessionProvider initialUser={user} initialProfile={profile}>
          <ToastProvider>
            <OfflineBanner />
            {children}
            <ServiceWorkerRegister />
          </ToastProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
