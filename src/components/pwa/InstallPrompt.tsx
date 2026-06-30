"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Share, X } from "lucide-react";
import { PawIcon } from "@/components/ui/PawIcon";
import { Button } from "@/components/ui/Button";

// Chrome's non-standard event for "Add to Home Screen".
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

const DISMISS_KEY = "pawpal-install-dismissed";

/**
 * Friendly "Add to Home Screen" prompt.
 * - Android/Chrome: uses the native beforeinstallprompt event.
 * - iOS Safari: shows manual Share → Add to Home Screen instructions
 *   (iOS doesn't support the install event).
 */
export function InstallPrompt() {
  const [deferred, setDeferred] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // Already installed (standalone)? Don't nag.
    const standalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      // @ts-expect-error iOS-only
      window.navigator.standalone === true;
    if (standalone) return;

    if (localStorage.getItem(DISMISS_KEY)) return;

    const ios =
      /iphone|ipad|ipod/i.test(window.navigator.userAgent) &&
      !/crios|fxios/i.test(window.navigator.userAgent);
    setIsIOS(ios);

    const onBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BeforeInstallPromptEvent);
      setShow(true);
    };
    window.addEventListener("beforeinstallprompt", onBeforeInstall);

    // iOS never fires the event — show the manual card after a short delay.
    let t: ReturnType<typeof setTimeout> | undefined;
    if (ios) t = setTimeout(() => setShow(true), 2500);

    return () => {
      window.removeEventListener("beforeinstallprompt", onBeforeInstall);
      if (t) clearTimeout(t);
    };
  }, []);

  const dismiss = () => {
    setShow(false);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {}
  };

  const install = async () => {
    if (!deferred) return;
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    dismiss();
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 120, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 120, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 26 }}
          className="fixed inset-x-3 bottom-24 z-50 mx-auto max-w-md rounded-4xl border border-white/60 bg-white/95 p-4 shadow-coral backdrop-blur md:bottom-6"
        >
          <button
            onClick={dismiss}
            aria-label="Dismiss"
            className="absolute right-3 top-3 rounded-full p-1 text-ink/40 hover:bg-black/5"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-sunny text-ink">
              <PawIcon className="h-7 w-7" />
            </div>
            <div className="pr-6">
              <p className="font-display font-bold text-ink">
                Install PawPal! 🐾
              </p>
              <p className="text-sm text-ink/60">
                {isIOS
                  ? "Tap Share then “Add to Home Screen”."
                  : "Add to your home screen for the app experience."}
              </p>
            </div>
          </div>

          {isIOS ? (
            <div className="mt-3 flex items-center justify-center gap-2 rounded-2xl bg-teal/10 px-4 py-2 text-sm font-semibold text-teal-dark">
              <Share className="h-4 w-4" /> Share → Add to Home Screen
            </div>
          ) : (
            <Button
              variant="coral"
              fullWidth
              size="sm"
              className="mt-3"
              onClick={install}
            >
              Add to Home Screen
            </Button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
