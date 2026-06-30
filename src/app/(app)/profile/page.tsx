"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useSession } from "@/components/providers/SessionProvider";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";

export default function ProfilePage() {
  const { user, profile, isProvider, refresh, signOut } = useSession();
  const supabase = getSupabaseBrowser();
  const toast = useToast();
  const router = useRouter();

  const [fullName, setFullName] = useState(profile?.full_name ?? "");
  const [phone, setPhone] = useState(profile?.phone ?? "");
  const [saving, setSaving] = useState(false);

  const save = async () => {
    if (!user) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone })
      .eq("id", user.id);
    if (error) toast.error("Couldn't save 🙈");
    else {
      toast.success("Saved! 🎉");
      await refresh();
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace("/login");
  };

  return (
    <div className="space-y-5">
      <header>
        <h1 className="font-display text-2xl font-extrabold text-ink">
          My Profile 🐾
        </h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-ink/60">
          {user?.email}
          <Badge
            className={
              isProvider
                ? "bg-coral text-white"
                : "bg-teal-light text-teal-dark"
            }
          >
            {isProvider ? "🦴 Provider" : "🐶 Customer"}
          </Badge>
        </div>
      </header>

      <Card className="space-y-3">
        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            id="name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="phone">Phone</Label>
          <Input
            id="phone"
            type="tel"
            placeholder="(555) 123-4567"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>
        <Button variant="coral" fullWidth loading={saving} onClick={save}>
          Save changes
        </Button>
      </Card>

      <Button variant="outline" fullWidth onClick={handleSignOut}>
        <LogOut className="h-4 w-4" /> Sign out
      </Button>
    </div>
  );
}
