"use client";

import { AnimatePresence, motion } from "framer-motion";

type InfoButtonProps = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
};

export function InfoButton({ open, onOpen, onClose }: InfoButtonProps) {
  return (
    <>
      <button
        type="button"
        onClick={onOpen}
        aria-label="Open Bia lore"
        className="flex h-9 w-9 items-center justify-center rounded-full text-white/50 transition hover:text-white active:text-white"
      >
        <span className="flex h-7 w-7 items-center justify-center rounded-full border border-current text-[13px] font-medium leading-none">
          i
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 px-4 backdrop-blur-xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          >
            <motion.div
              className="w-full max-w-md rounded-[28px] border border-white/20 bg-slate-950/72 p-6 text-white shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 280, damping: 22 }}
              onClick={(event) => event.stopPropagation()}
            >
              <h2 className="text-center text-lg font-bold uppercase tracking-[0.28em] text-white/92">
                The Essence of BIA
              </h2>
              <div className="mt-5 space-y-4 text-sm leading-relaxed text-white/78">
                <p>
                  In the silent vacuum before the first star, there was Bia-the primordial force of Energy and Will.
                </p>
                <p>
                  Bia is the spark that turns stardust into life. It thrives on &apos;Sync&apos;-the resonance between your care and
                  its cosmic core. As you bond, you aren&apos;t just raising a pet; you are fueling a star.
                </p>
              </div>
              <div className="mt-6 flex justify-center">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-full border border-white/20 px-5 py-2 text-sm font-semibold tracking-[0.08em] text-white/90 transition hover:bg-white/10"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
