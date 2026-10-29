"use client";

import { useCallback, useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { FloatingArrow, arrow, autoPlacement, autoUpdate, offset, shift, useFloating } from "@floating-ui/react";
import type { PracticeStep, Spot } from "@/lib/practice";
import { PRACTICE_TOTAL } from "@/lib/practice";
import type { PerformanceStats } from "@/lib/metrics";
import type { Rect } from "@/lib/layout";
import { STAGE_H, STAGE_W } from "@/components/Stage";
import { FOUNDER_NAME } from "@/lib/messages";
import { num, pct, pctPlain } from "@/lib/format";
import { Button, FounderAvatar } from "@/components/ui";

export interface CoachProps {
  /** What the box points at. Null centers the box with no arrow. */
  spot: Spot;
  step: PracticeStep;
  index: number;
  text: string;
  nudge: string | null;
  scoreboard?: { you: PerformanceStats; bnh: PerformanceStats } | null;
  onContinue: () => void;
  onSkip: () => void;
}

const BOX_W = 560;
const ROYAL = "#00539B";

/** Rect of an element in stage coordinates (the stage is CSS-scaled to fit the window). */
function stageRectOf(el: Element): Rect | null {
  const stage = document.querySelector("[data-stage]");
  if (!stage) return null;
  const s = stage.getBoundingClientRect();
  const scale = s.width / STAGE_W;
  const r = el.getBoundingClientRect();
  return { x: (r.left - s.left) / scale, y: (r.top - s.top) / scale, w: r.width / scale, h: r.height / scale };
}

export default function PracticeCoach({ spot, step, index, text, nudge, scoreboard, onContinue, onSkip }: CoachProps) {
  const [arrowEl, setArrowEl] = useState<SVGSVGElement | null>(null);
  const [target, setTarget] = useState<Rect | null>(null);
  const [boxH, setBoxH] = useState(160);

  const measure = useCallback((reference: Element | null) => {
    setTarget(reference ? stageRectOf(reference) : null);
  }, []);

  const { refs, x, y, context, elements, isPositioned } = useFloating({
    strategy: "absolute",
    placement: "top",
    transform: false,
    middleware: [offset(14), autoPlacement({ padding: 24 }), shift({ padding: 20 }), arrow({ element: arrowEl, padding: 16 })],
    whileElementsMounted: (reference, floating, update) =>
      autoUpdate(reference, floating, () => {
        update();
        measure(reference instanceof Element ? reference : null);
      }),
  });

  // Point at the element tagged with the current spot. Re-run when the step changes or the DOM may have changed.
  useEffect(() => {
    const el = spot ? document.querySelector(`[data-spot="${spot}"]`) : null;
    refs.setReference(el);
  }, [spot, index, refs]);

  // Keep the centered layout accurate when the box's height changes (scoreboard, nudge).
  useEffect(() => {
    const el = elements.floating;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxH(el.offsetHeight));
    ro.observe(el);
    return () => ro.disconnect();
  }, [elements.floating]);

  const floating = !!spot && !!elements.reference && isPositioned;
  const shown = floating ? target : null;
  const pos = floating ? { x: x ?? 0, y: y ?? 0 } : { x: STAGE_W / 2 - BOX_W / 2, y: STAGE_H / 2 - boxH / 2 };
  const waiting = !!step.action;

  return (
    <>
      <style>{`
        @keyframes coach-glow {
          0%, 100% { box-shadow: 0 0 0 3px ${ROYAL}, 0 0 18px 6px rgba(0,83,155,0.55); }
          50% { box-shadow: 0 0 0 5px ${ROYAL}, 0 0 36px 14px rgba(0,83,155,0.35); }
        }
      `}</style>
      <div className="absolute left-5 top-5 z-[60] rounded-full border border-white/40 bg-royal px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-white shadow-md">
        Practice
      </div>

      {/* dim everything except the target, and glow the target */}
      <motion.div
        className="pointer-events-none absolute z-30 rounded-[8px]"
        initial={false}
        animate={shown ? { left: shown.x - 6, top: shown.y - 6, width: shown.w + 12, height: shown.h + 12, opacity: 1 } : { left: -40, top: -40, width: STAGE_W + 80, height: STAGE_H + 80, opacity: 1 }}
        transition={{ type: "spring", stiffness: 170, damping: 24 }}
        style={{ boxShadow: "0 0 0 4000px rgba(1, 10, 36, 0.45)" }}
      />
      <motion.div
        className="pointer-events-none absolute z-30 rounded-[8px]"
        initial={false}
        animate={shown ? { left: shown.x - 6, top: shown.y - 6, width: shown.w + 12, height: shown.h + 12, opacity: 1 } : { opacity: 0 }}
        transition={{ type: "spring", stiffness: 170, damping: 24 }}
        style={{ animation: "coach-glow 1.6s ease-in-out infinite" }}
      />

      {/* the founder's box */}
      <motion.div
        // Floating UI's setter is a callback ref, not a ref read; the lint rule can't tell.
        // eslint-disable-next-line react-hooks/refs
        ref={refs.setFloating}
        className="absolute z-[60] rounded-xl border-2 border-royal bg-navy-panel/95 p-4 text-white shadow-[0_20px_60px_rgba(0,0,0,0.45)] backdrop-blur-sm"
        style={{ width: BOX_W, left: 0, top: 0 }}
        initial={false}
        animate={{ x: pos.x, y: pos.y }}
        transition={{ type: "spring", stiffness: 170, damping: 26 }}
      >
        {floating && <FloatingArrow ref={setArrowEl} context={context} width={30} height={15} tipRadius={2} fill="#00539b" stroke="#ffffff" strokeWidth={1.5} />}
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
                  <motion.i className="inline-block h-2 w-2 rounded-full bg-royal-bright" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 1.4 }} />
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
