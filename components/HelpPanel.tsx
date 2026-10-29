"use client";

import { AnimatePresence, motion } from "framer-motion";
import { DEFINITIONS } from "@/lib/tips";
import { Button } from "@/components/ui";

export function HelpButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Help"
      title="Help"
      className="absolute z-[70] flex h-9 w-9 items-center justify-center rounded-full bg-royal text-[17px] font-semibold text-white shadow-[0_4px_14px_rgba(0,83,155,0.45)] transition-transform duration-150 hover:scale-110 hover:bg-royal-bright"
      style={{ right: 22, top: 18 }}
    >
      ?
    </button>
  );
}

export default function HelpPanel({
  open,
  tip,
  onClose,
  onReplayPractice,
  onAskFounder,
}: {
  open: boolean;
  tip: string;
  onClose: () => void;
  onReplayPractice: () => void;
  onAskFounder: () => void;
}) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="help"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="absolute inset-0 z-[65] bg-[#0b1a3d]/30"
          onClick={onClose}
        >
          <motion.aside
            initial={{ x: 40, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 40, opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.2, 0.8, 0.2, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="absolute bottom-4 right-4 top-4 flex w-[380px] flex-col rounded-xl border border-white/10 bg-navy-panel/95 p-5 text-white shadow-[0_30px_80px_rgba(0,0,0,0.5)] backdrop-blur-sm"
          >
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold uppercase tracking-[0.22em] text-silver/60">Help</span>
              <button type="button" onClick={onClose} aria-label="Close help" className="flex h-7 w-7 items-center justify-center rounded-md text-silver hover:bg-white/10 hover:text-white">
                ✕
              </button>
            </div>
            <div className="mt-3 rounded-lg border border-royal/50 bg-royal/15 px-3 py-2.5">
              <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-royal-bright">What to do next</div>
              <p className="mt-1 text-[13.5px] leading-snug text-white">{tip}</p>
            </div>
            <div className="mt-4 text-[10px] font-semibold uppercase tracking-[0.18em] text-silver/60">Quick definitions</div>
            <ul className="monitor-scroll mt-1.5 min-h-0 flex-1 space-y-1.5 overflow-y-auto pr-1">
              {DEFINITIONS.map((d) => (
                <li key={d.term} className="text-[12.5px] leading-snug text-silver">
                  <span className="font-semibold text-white">{d.term}.</span> {d.text}
                </li>
              ))}
            </ul>
            <div className="mt-4 flex gap-2">
              <Button variant="ghost" className="flex-1" onClick={onReplayPractice}>
                Replay practice round
              </Button>
              <Button className="flex-1" onClick={onAskFounder}>
                Ask the founder
              </Button>
            </div>
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
