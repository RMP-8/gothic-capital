"use client";

import { GLOSSARY } from "@/lib/lessons";
import { FOUNDER_NAME } from "@/lib/messages";
import { Button, Card, FounderAvatar, Overlay } from "@/components/ui";

export default function TrainingRecap({ onPractice, onLevels }: { onPractice: () => void; onLevels: () => void }) {
  return (
    <Overlay>
      <Card className="w-[860px] p-6">
        <div className="flex items-center gap-3">
          <FounderAvatar size={44} />
          <div>
            <div className="text-[14px] font-semibold">{FOUNDER_NAME}</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-silver/60">Founder, Gothic Capital</div>
          </div>
          <div className="ml-auto flex items-center gap-2 rounded-full border border-royal-bright/60 bg-royal/20 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-white">
            <span className="flex h-4 w-4 items-center justify-center rounded-full bg-gain text-[10px]">✓</span>
            Training complete
          </div>
        </div>
        <h2 className="mt-4 text-[22px] font-semibold">Training Day done. You now speak the language.</h2>
        <p className="mt-1 text-[14px] leading-relaxed text-silver">
          Fifteen terms, fifteen right answers. The badge is on your desk and the practice round is unlocked. Here is everything in one place; it&apos;s also in the glossary behind the ? button.
        </p>
        <div className="monitor-scroll mt-4 grid max-h-[300px] grid-cols-2 gap-x-6 gap-y-1.5 overflow-y-auto pr-1">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="text-[12.5px] leading-snug text-silver">
              <span className="font-semibold text-white">{g.term}.</span> {g.text}
            </div>
          ))}
        </div>
        <div className="mt-5 flex justify-end gap-2">
          <Button variant="ghost" onClick={onLevels}>
            Back to levels
          </Button>
          <Button className="px-5" onClick={onPractice}>
            Start Level 2: Practice Round
          </Button>
        </div>
      </Card>
    </Overlay>
  );
}
