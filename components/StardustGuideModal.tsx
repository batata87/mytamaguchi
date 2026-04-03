"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles, X } from "lucide-react";
import type { PetStage } from "@/lib/game";

type StardustGuideModalProps = {
  open: boolean;
  onClose: () => void;
  petName: string;
  stage: PetStage;
};

export function StardustGuideModal({ open, onClose, petName, stage }: StardustGuideModalProps) {
  const afterHatch = stage !== "egg";

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[82] flex items-center justify-center bg-slate-950/45 px-4 pb-[env(safe-area-inset-bottom)] pt-[env(safe-area-inset-top)] backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-labelledby="stardust-guide-title"
            aria-modal="true"
            className="relative w-full max-w-sm overflow-hidden rounded-[1.75rem] border border-white/40 bg-gradient-to-b from-white/70 via-violet-50/65 to-indigo-100/55 p-5 text-slate-800 shadow-[0_24px_50px_rgba(76,29,149,0.2)] backdrop-blur-xl"
            initial={{ scale: 0.94, opacity: 0.9 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.96, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-slate-600 transition hover:bg-white/60"
              aria-label="Close"
            >
              <X className="h-5 w-5" strokeWidth={2} />
            </button>
            <div className="mb-3 flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-violet-200/60 bg-white/50 shadow-inner">
                <Sparkles className="h-5 w-5 text-violet-600" strokeWidth={2} />
              </div>
              <h2 id="stardust-guide-title" className="pr-8 text-lg font-bold tracking-tight text-indigo-950">
                How stardust works
              </h2>
            </div>
            <p className="mb-3 text-sm font-medium leading-relaxed text-slate-700">
              Stardust is your cosmic souvenir. Collect it over time — there’s no rush. Use it in the{" "}
              <span className="font-semibold text-violet-800">boutique</span> (tap the{" "}
              <span className="font-semibold">+</span> or the <span className="font-semibold">bag</span> in the top bar).
            </p>
            <ul className="space-y-2.5 text-sm text-slate-700">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 text-violet-500" aria-hidden>
                  ✦
                </span>
                <span>
                  <span className="font-semibold text-slate-900">Daily visit</span> — the first time you open the game
                  each day, you get a login bonus of stardust.
                </span>
              </li>
              {afterHatch ? (
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-violet-500" aria-hidden>
                    ✦
                  </span>
                  <span>
                    <span className="font-semibold text-slate-900">Hold {petName}</span> — press and hold your companion
                    on the screen. You earn about <span className="font-semibold">1 stardust every 5 seconds</span> while
                    you keep holding.
                  </span>
                </li>
              ) : (
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-violet-500" aria-hidden>
                    ✦
                  </span>
                  <span>
                    <span className="font-semibold text-slate-900">After hatch</span> — you’ll also earn stardust by
                    holding {petName} and by catching sparkles (see below).
                  </span>
                </li>
              )}
              {afterHatch ? (
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 text-violet-500" aria-hidden>
                    ✦
                  </span>
                  <span>
                    <span className="font-semibold text-slate-900">Star droplets</span> — sometimes a glowing{" "}
                    <span className="font-semibold">✦</span> appears near {petName}. Tap it to collect bonus stardust.
                  </span>
                </li>
              ) : null}
            </ul>
            <button
              type="button"
              onClick={onClose}
              className="app-tap-target mt-5 w-full rounded-2xl bg-violet-600/90 py-3 text-sm font-bold text-white shadow-md transition hover:bg-violet-600 enabled:active:scale-[0.99]"
            >
              Got it
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
