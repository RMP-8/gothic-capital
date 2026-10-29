"use client";

import { AnimatePresence, motion } from "framer-motion";
import type { PracticeStep } from "@/lib/practice";
import { PRACTICE_TOTAL } from "@/lib/practice";
import type { PerformanceStats } from "@/lib/metrics";
import { FOUNDER_NAME } from "@/lib/messages";
import { num, pct, pctPlain } from "@/lib/format";
import { Button, FounderAvatar } from "@/components/ui";

export interface CoachProps {
  step: PracticeStep;
  index: number;
  text: string;
  nudge: string | null;
  scoreboard?: { you: PerformanceStats; bnh: PerformanceStats } | null;
  onContinue: () => void;
  onSkip: () => void;
}

export default function PracticeCoach({ step, index, text, nudge, scoreboard, onContinue, onSkip }: CoachProps) {
  const waiting = !!step.action;
  return (
    <>
      <div className="absolute left-5 top-5 z-[60] rounded-full border border-white/40 bg-royal px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-md">
        Practice
      </div>
      <motion.div
        className="absolute left-1/2 top-4 z-[60] w-[680px] -translate-x-1/2 rounded-xl border border-white/10 bg-navy-panel/95 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm"
      >
        <div className="flex items-start gap-3">
          <FounderAvatar size={38} />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between">
              <span className="text-[12px] font-semibold">{FOUNDER_NAME}</span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-silver/60">
                Step {index + 1} of {PRACTICE_TOTAL}
              </span>
            </div>
            <motion.p
              key={step.id}
              initial={{ opacity: 0, y: 6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="mt-1 text-[14px] leading-snug text-silver"
            >
              {text}
            </motion.p>
            <AnimatePresence>
              {nudge && (
                <motion.p
                  key={nudge}
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: [0, -4, 4, -3, 3, 0] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                  className="mt-1.5 rounded-md border border-loss/40 bg-loss/10 px-2 py-1 text-[12.5px] text-loss"
                >
                  {nudge}
                </motion.p>
              )}
            </AnimatePresence>
            {scoreboard && (
              <div className="mt-2 grid grid-cols-3 gap-2">
                {[
                  { label: "Sharpe ratio", you: num(scoreboard.you.sharpe), bnh: num(scoreboard.bnh.sharpe), why: "return per unit of risk" },
                  {
                    label: "Max drawdown",
                    you: scoreboard.you.maxDrawdown > 0 ? `-${pctPlain(scoreboard.you.maxDrawdown)}` : "0.0%",
                    bnh: scoreboard.bnh.maxDrawdown > 0 ? `-${pctPlain(scoreboard.bnh.maxDrawdown)}` : "0.0%",
                    why: "biggest peak-to-low drop",
                  },
                  { label: "IRR", you: pct(scoreboard.you.irr), bnh: pct(scoreboard.bnh.irr), why: "yearly return on your money" },
                ].map((m) => (
                  <div key={m.label} className="rounded-md border border-white/10 bg-white/[0.04] px-2 py-1.5">
                    <div className="text-[9.5px] uppercase tracking-[0.15em] text-silver/60">{m.label}</div>
                    <div className="tabular text-[15px] font-semibold leading-tight">
                      {m.you} <span className="text-[11px] font-normal text-silver/60">vs {m.bnh}</span>
                    </div>
                    <div className="text-[10.5px] text-silver/60">{m.why}</div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-2.5 flex items-center justify-between">
              <button type="button" onClick={onSkip} className="text-[11.5px] text-silver/60 underline-offset-2 hover:text-white hover:underline">
                Skip tutorial
              </button>
              {waiting ? (
                <span className="flex items-center gap-2 text-[11.5px] text-silver/70">
                  <motion.i
                    className="inline-block h-2 w-2 rounded-full bg-royal-bright"
                    animate={{ opacity: [0.3, 1, 0.3] }}
                    transition={{ repeat: Infinity, duration: 1.4 }}
                  />
                  Your move
                </span>
              ) : (
                <Button className="px-4 py-1.5" onClick={onContinue}>
                  {step.button ?? "Continue"}
                </Button>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
