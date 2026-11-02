"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PracticeStep } from "@/lib/practice";
import { PRACTICE_TOTAL } from "@/lib/practice";
import type { PerformanceStats } from "@/lib/metrics";
import { FOUNDER_NAME } from "@/lib/messages";
import { num, pct, pctPlain } from "@/lib/format";
import { Button, FounderAvatar } from "@/components/ui";

/** Phone version of the practice coach: a sheet above the action bar. */
export default function MobileCoach({
  step,
  index,
  text,
  nudge,
  scoreboard,
  onContinue,
  onSkip,
}: {
  step: PracticeStep;
  index: number;
  text: string;
  nudge: string | null;
  scoreboard?: { you: PerformanceStats; bnh: PerformanceStats } | null;
  onContinue: () => void;
  onSkip: () => void;
}) {
  const waiting = !!step.action;
  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed inset-x-2 bottom-[74px] z-[60] rounded-xl border-2 border-royal bg-navy-panel/95 p-3 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm"
    >
      <div className="flex items-start gap-2.5">
        <FounderAvatar size={32} />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-[11.5px] font-semibold">{FOUNDER_NAME}</span>
            <span className="text-[9.5px] uppercase tracking-[0.18em] text-silver/60">
              Step {index + 1} of {PRACTICE_TOTAL}
            </span>
          </div>
          <motion.p key={step.id} initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }} className="mt-0.5 text-[13px] leading-snug text-silver">
            {text}
          </motion.p>
          <AnimatePresence>
            {nudge && (
              <motion.p key={nudge} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1.5 rounded-md border border-loss/40 bg-loss/10 px-2 py-1 text-[12px] text-loss">
                {nudge}
              </motion.p>
            )}
          </AnimatePresence>
          {scoreboard && (
            <div className="mt-2 grid grid-cols-3 gap-1.5">
              {[
                { label: "Sharpe", you: num(scoreboard.you.sharpe), bnh: num(scoreboard.bnh.sharpe) },
                { label: "Drawdown", you: scoreboard.you.maxDrawdown > 0 ? `-${pctPlain(scoreboard.you.maxDrawdown)}` : "0.0%", bnh: scoreboard.bnh.maxDrawdown > 0 ? `-${pctPlain(scoreboard.bnh.maxDrawdown)}` : "0.0%" },
                { label: "IRR", you: pct(scoreboard.you.irr), bnh: pct(scoreboard.bnh.irr) },
              ].map((m) => (
                <div key={m.label} className="rounded-md border border-white/10 bg-white/[0.04] px-1.5 py-1">
                  <div className="text-[9px] uppercase tracking-[0.12em] text-silver/60">{m.label}</div>
                  <div className="tabular text-[13px] font-semibold leading-tight">
                    {m.you} <span className="text-[10px] font-normal text-silver/60">vs {m.bnh}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <button type="button" onClick={onSkip} className="text-[11px] text-silver/60 underline-offset-2 hover:underline">
              Skip tutorial
            </button>
            {waiting ? (
              <span className="flex items-center gap-1.5 text-[11px] text-silver/70">
                <motion.i className="inline-block h-2 w-2 rounded-full bg-royal-bright" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4 }} />
                Your move
              </span>
            ) : (
              <Button className="px-3.5 py-1.5" onClick={onContinue}>
                {step.button ?? "Continue"}
              </Button>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
