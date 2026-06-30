import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppHeader } from "@/components/nav/AppHeader";
import { BottomNav } from "@/components/nav/BottomNav";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";

// Shared shell for every signed-in screen: header, bottom nav, install prompt.
export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Belt-and-suspenders: middleware already guards, but never render app shell
  // to a signed-out user.
  if (!user) redirect("/login");

  return (
    <div className="relative min-h-[100dvh] bg-joy-mesh">
      <AppHeader />
      <main className="mx-auto w-full max-w-md px-4 pb-32 pt-4">{children}</main>
      <BottomNav />
      <InstallPrompt />
    </div>
  );
}
