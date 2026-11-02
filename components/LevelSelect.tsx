"use client";

import { motion } from "framer-motion";
import { FOUNDER_NAME } from "@/lib/messages";
import { Button, Card, FounderAvatar } from "@/components/ui";

export type Level = "training" | "practice" | "real";
export type LevelsDone = Record<Level, boolean>;

const LEVELS: { id: Level; n: number; title: string; blurb: string; time: string }[] = [
  { id: "training", n: 1, title: "Training Day", blurb: "Learn what every term means, with a quick question after each one.", time: "about 10 minutes" },
  { id: "practice", n: 2, title: "Practice Round", blurb: "A guided walkthrough with play money: buy, sell, options, expiry.", time: "about 3 minutes" },
  { id: "real", n: 3, title: "The Real Game", blurb: "Five years of real prices, $100,000, and a review against buy-and-hold.", time: "15 to 30 minutes" },
];

export default function LevelSelect({ ticker, done, onPick }: { ticker: string; done: LevelsDone; onPick: (l: Level) => void }) {
  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center overflow-y-auto bg-white/25 p-3 backdrop-blur-[3px]">
      <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.45, ease: [0.2, 0.8, 0.2, 1] }}>
        <Card className="w-[900px] p-5 sm:p-7">
          <div className="flex items-center gap-3">
            <FounderAvatar size={44} />
            <div>
              <div className="text-[14px] font-semibold">{FOUNDER_NAME}</div>
              <div className="text-[11px] uppercase tracking-[0.18em] text-silver/60">Founder, Gothic Capital</div>
            </div>
            <div className="ml-auto text-[11px] uppercase tracking-[0.18em] text-silver/60">Ticker · {ticker}</div>
          </div>
          <h1 className="mt-4 text-[20px] font-semibold sm:text-[24px]">Welcome to your first day. Pick where to start.</h1>
          <p className="mt-1 text-[14px] text-silver">New to this? Start at Level 1. Already trade? Jump straight to the real game.</p>

          <div className="relative mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-4">
            {/* path line */}
            <div className="pointer-events-none absolute left-[16%] right-[16%] top-[26px] hidden h-[3px] rounded bg-white/10 sm:block" />
            {LEVELS.map((lv) => (
              <div key={lv.id} className="relative flex flex-col items-center">
                <div
                  className={`relative z-10 flex h-[54px] w-[54px] items-center justify-center rounded-full border-2 text-[18px] font-semibold ${
                    done[lv.id] ? "border-gain bg-gain text-white" : "border-royal-bright bg-navy-deep text-white"
                  }`}
                >
                  {done[lv.id] ? "✓" : lv.n}
                </div>
                <div className="mt-2 flex w-full flex-col rounded-xl sm:mt-3 sm:min-h-[150px] border border-white/10 bg-white/[0.03] px-4 py-3 text-center">
                  <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-silver/60">Level {lv.n}</div>
                  <div className="text-[16px] font-semibold">{lv.title}</div>
                  <p className="mt-1 text-[12px] leading-snug text-silver">{lv.blurb}</p>
                  <div className="mt-1 text-[10.5px] text-silver/55">{lv.time}</div>
                  <Button className="mt-auto w-full" variant={done[lv.id] ? "ghost" : "primary"} onClick={() => onPick(lv.id)}>
                    {done[lv.id] ? "Play again" : "Start"}
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </motion.div>
    </div>
  );
}
