"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { WifiOff } from "lucide-react";

/** Slim banner shown when the device goes offline (cached data still works). */
export function OfflineBanner() {
  const [offline, setOffline] = useState(false);

  useEffect(() => {
    const update = () => setOffline(!navigator.onLine);
    update();
    window.addEventListener("online", update);
    window.addEventListener("offline", update);
    return () => {
      window.removeEventListener("online", update);
      window.removeEventListener("offline", update);
    };
  }, []);

  return (
    <AnimatePresence>
      {offline && (
        <motion.div
          initial={{ y: -40 }}
          animate={{ y: 0 }}
          exit={{ y: -40 }}
          className="fixed inset-x-0 top-0 z-[80] flex items-center justify-center gap-2 bg-ink py-2 text-center text-sm font-semibold text-white"
        >
          <WifiOff className="h-4 w-4" />
          You&apos;re offline — showing your saved bookings 🐾
        </motion.div>
      )}
    </AnimatePresence>
  );
}
