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

/** One-time stardust when egg hatches — keep in sync with grant in PetCard */
export const HATCH_STARDUST_BONUS = 15;

/** First open each calendar day — keep in sync with daily grant in PetCard */
export const DAILY_LOGIN_STARDUST = 8;

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
                How you get stardust
              </h2>
            </div>
            <p className="mb-3 text-xs font-medium text-slate-600">
              Spend it in the <span className="font-semibold text-violet-800">shop</span> — tap the{" "}
              <span className="font-semibold">bag</span> icon next to the memory book.
            </p>
            <ul className="space-y-3 text-sm leading-snug text-slate-800">
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-violet-600" aria-hidden>
                  1.
                </span>
                <span>
                  <span className="font-semibold">First time you open the game each calendar day</span>, you get{" "}
                  <span className="font-semibold">+{DAILY_LOGIN_STARDUST} stardust</span> automatically. Opening again the same
                  day does not add more.
                </span>
              </li>
              <li className="flex gap-2">
                <span className="mt-0.5 shrink-0 font-bold text-violet-600" aria-hidden>
                  2.
                </span>
                <span>
                  <span className="font-semibold">When your egg hatches</span> you get a{" "}
                  <span className="font-semibold">one-time +{HATCH_STARDUST_BONUS} stardust</span> welcome gift.
                </span>
              </li>
              {afterHatch ? (
                <>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 font-bold text-violet-600" aria-hidden>
                      3.
                    </span>
                    <span>
                      <span className="font-semibold">Press and hold {petName}</span> on the screen (not a quick tap).
                      Every <span className="font-semibold">5 seconds</span> you keep holding, you get{" "}
                      <span className="font-semibold">+1 stardust</span>.
                    </span>
                  </li>
                  <li className="flex gap-2">
                    <span className="mt-0.5 shrink-0 font-bold text-violet-600" aria-hidden>
                      4.
                    </span>
                    <span>
                      When a glowing <span className="font-semibold">✦</span> appears near {petName},{" "}
                      <span className="font-semibold">tap it</span> — you get <span className="font-semibold">+2 stardust</span>{" "}
                      each time.
                    </span>
                  </li>
                </>
              ) : (
                <li className="flex gap-2">
                  <span className="mt-0.5 shrink-0 font-bold text-violet-600" aria-hidden>
                    3.
                  </span>
                  <span>
                    After hatch: <span className="font-semibold">hold {petName}</span> for +1 stardust every 5 seconds, and{" "}
                    <span className="font-semibold">tap ✦</span> sparkles for +2 each.
                  </span>
                </li>
              )}
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
