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

  const handleGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(
          next,
        )}`,
      },
    });
    if (error) toast.error(error.message);
  };

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

        {/* Google */}
        <Button
          variant="outline"
          fullWidth
          onClick={handleGoogle}
          type="button"
          className="mb-4"
        >
          <GoogleGlyph /> Continue with Google
        </Button>

        <div className="my-4 flex items-center gap-3 text-xs font-bold uppercase text-ink/30">
          <span className="h-px flex-1 bg-ink/10" /> or <span className="h-px flex-1 bg-ink/10" />
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

function GoogleGlyph() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.1a6.6 6.6 0 0 1 0-4.2V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1A11 11 0 0 0 2.18 7.06l3.66 2.84C6.71 7.3 9.14 5.38 12 5.38Z"
      />
    </svg>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginInner />
    </Suspense>
  );
}
