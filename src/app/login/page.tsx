"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion } from "framer-motion";
import { getSupabaseBrowser } from "@/lib/supabase/client";
import { useSession } from "@/components/providers/SessionProvider";
import { Button } from "@/components/ui/Button";
import { Input, Label } from "@/components/ui/Field";
import { PawConfettiBg, PawIcon } from "@/components/ui/PawIcon";
import { useToast } from "@/components/ui/Toast";

function LoginInner() {
  const supabase = getSupabaseBrowser();
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const { refresh } = useSession();
  const toast = useToast();

  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName } },
        });
        if (error) throw error;
        toast.success("Welcome to the pack! 🎉");
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Welcome back! 🐾");
      }
      await refresh();
      router.replace(next);
    } catch (err) {
      toast.error(
        err instanceof Error ? err.message : "Something went wrong 🙈",
      );
    } finally {
      setLoading(false);
    }
  };

  // Google sign-in is hidden until the Google OAuth provider is configured in
  // Supabase (Auth → Providers → Google). To restore it, re-add handleGoogle,
  // the GoogleGlyph component, and the button block below — see git history.

  return (
    <main className="joy-bg relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden px-6 py-10">
      <PawConfettiBg />

      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 240, damping: 22 }}
        className="relative z-10 w-full max-w-sm rounded-5xl border border-white/60 bg-white/90 p-7 shadow-[0_20px_60px_-20px_rgba(45,42,69,0.4)] backdrop-blur"
      >
        <div className="mb-6 flex flex-col items-center text-center">
          <motion.span
            animate={{ rotate: [-6, 6, -6] }}
            transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
            className="mb-3 grid h-16 w-16 place-items-center rounded-3xl bg-coral text-white shadow-coral"
          >
            <PawIcon className="h-9 w-9" />
          </motion.span>
          <h1 className="font-display text-2xl font-extrabold text-ink">
            {mode === "signup" ? "Join the pack!" : "Welcome back!"}
          </h1>
          <p className="text-sm text-ink/60">
            {mode === "signup"
              ? "Create your account to start booking 🐶"
              : "Sign in to book happy walks 🦴"}
          </p>
        </div>

        <form onSubmit={handleEmailAuth} className="space-y-3">
          {mode === "signup" && (
            <div>
              <Label htmlFor="fullName">Your name</Label>
              <Input
                id="fullName"
                placeholder="Alex Pup-Lover"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>
          )}
          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />
          </div>
          <div>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete={
                mode === "signup" ? "new-password" : "current-password"
              }
            />
          </div>

          <Button
            type="submit"
            variant="coral"
            fullWidth
            size="lg"
            loading={loading}
            className="mt-2"
          >
            {mode === "signup" ? "Create account 🎉" : "Sign in 🐾"}
          </Button>
        </form>

        <p className="mt-5 text-center text-sm text-ink/60">
          {mode === "signup"
            ? "Already have an account?"
            : "New to PawPal?"}{" "}
          <button
            onClick={() => setMode(mode === "signup" ? "signin" : "signup")}
            className="font-display font-bold text-coral hover:underline"
          >
            {mode === "signup" ? "Sign in" : "Sign up free"}
          </button>
        </p>
      </motion.div>

      <Link
        href="/"
        className="relative z-10 mt-6 font-display text-sm font-bold text-ink/50 hover:text-ink"
      >
        ← Back to welcome
      </Link>
    </main>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
