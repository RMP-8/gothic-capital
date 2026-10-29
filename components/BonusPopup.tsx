"use client";

import { motion } from "framer-motion";
import type { Bonus } from "@/lib/types";
import { money, pct } from "@/lib/format";
import { Button, Card, FounderAvatar, Overlay } from "@/components/ui";

export default function BonusPopup({ bonus, title, onClose }: { bonus: Bonus; title: string; onClose: () => void }) {
  const up = bonus.yearReturn >= 0;
  return (
    <Overlay onClose={onClose}>
      <Card className="w-[480px] p-7 text-center">
        <div className="text-[11px] font-semibold uppercase tracking-[0.2em] text-silver/60">Year {bonus.year} review</div>
        <div className="mt-3 flex justify-center">
          <FounderAvatar size={48} />
        </div>
        <div className={`tabular mt-3 text-[15px] ${up ? "text-gain" : "text-loss"}`}>{pct(bonus.yearReturn)} this year</div>
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 18, delay: 0.15 }}
          className="tabular mt-1 text-[44px] font-semibold leading-none text-white"
        >
          {money(bonus.amount)}
        </motion.div>
        <div className="mt-1 text-[12px] text-silver/70">year-end bonus</div>
        <p className="mt-4 text-[14px] leading-relaxed text-silver">
          {bonus.beatBenchmark
            ? `You finished the year ahead of buy-and-hold, so that includes the $5,000 alpha bonus. Your title: ${title}.`
            : up
              ? "A positive year, though buy-and-hold is still ahead. The base bonus is for showing up every Monday."
              : "A down year. Everyone gets the base bonus, and nobody gets fired for one bad year. Let's see year " + (bonus.year + 1) + "."}
        </p>
        <Button className="mt-5 px-6 py-2" onClick={onClose}>
          Back to the desk
        </Button>
      </Card>
    </Overlay>
  );
}
