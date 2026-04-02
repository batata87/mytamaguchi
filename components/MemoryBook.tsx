"use client";

import { motion, AnimatePresence } from "framer-motion";
import { BookHeart, X } from "lucide-react";

type MemoryBookProps = {
  open: boolean;
  onClose: () => void;
  memoryKeys: string[];
  stardust: number;
  /** How you’ve been raising Bia (shown once in the book, not on the creature). */
  careStyleNote?: string;
};

function formatMemoryLabel(key: string): string {
  const [action, sub, scene] = key.split(":");
  const sceneNice = scene ? scene.charAt(0).toUpperCase() + scene.slice(1) : "";
  return `${action} · ${sub}${sceneNice ? ` · ${sceneNice}` : ""}`;
}

export function MemoryBook({ open, onClose, memoryKeys, stardust, careStyleNote }: MemoryBookProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            role="dialog"
            aria-labelledby="memory-book-title"
            className="relative max-h-[min(85vh,560px)] w-full max-w-md overflow-hidden rounded-3xl border border-white/25 bg-gradient-to-b from-slate-900/95 to-indigo-950/95 p-5 text-white shadow-2xl"
            initial={{ scale: 0.92, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            transition={{ type: "spring", damping: 26, stiffness: 320 }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onClose}
              className="absolute right-3 top-3 rounded-full p-1.5 text-white/70 hover:bg-white/10 hover:text-white"
              aria-label="Close"
            >
              <X size={18} />
            </button>
            <div className="mb-4 flex items-center gap-2">
              <BookHeart className="text-pink-300" size={22} />
              <h2 id="memory-book-title" className="text-lg font-bold tracking-tight">
                Memory Book
              </h2>
            </div>
            <p className="mb-2 text-xs text-white/65">
              Stickers unlock when you try a new care combo or room. Stardust:{" "}
              <span className="font-semibold text-amber-200">{stardust}</span>
            </p>
            {careStyleNote ? (
              <p className="mb-3 text-[11px] text-white/55">
                Your care style: <span className="font-medium text-white/85">{careStyleNote}</span>
              </p>
            ) : null}
            <div className="max-h-[min(50vh,360px)] space-y-2 overflow-y-auto pr-1">
              {memoryKeys.length === 0 ? (
                <p className="text-sm text-white/55">Nothing yet — play, feed, and explore scenes to fill this book.</p>
              ) : (
                memoryKeys.map((key) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-white/15 bg-white/8 px-3 py-2 text-xs font-medium text-white/90"
                  >
                    {formatMemoryLabel(key)}
                  </div>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
