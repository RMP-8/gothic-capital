"use client";

import { FOUNDER_NAME } from "@/lib/messages";
import { Button, Card, FounderAvatar, Overlay } from "@/components/ui";

export default function ChoiceModal({ ticker, onPractice, onReal }: { ticker: string; onPractice: () => void; onReal: () => void }) {
  return (
    <Overlay>
      <Card className="w-[540px] p-7">
        <div className="flex items-center gap-3">
          <FounderAvatar size={44} />
          <div>
            <div className="text-[14px] font-semibold">{FOUNDER_NAME}</div>
            <div className="text-[11px] uppercase tracking-[0.18em] text-silver/60">Founder, Gothic Capital</div>
          </div>
        </div>
        <h2 className="mt-5 text-[22px] font-semibold">Welcome aboard.</h2>
        <p className="mt-2 text-[15px] leading-relaxed text-silver">
          Before I hand you the real $100,000 and five years of {ticker}, want a quick practice round? It takes a couple of
          minutes with play money, and nothing in it counts.
        </p>
        <div className="mt-6 flex justify-end gap-2">
          <Button variant="ghost" onClick={onReal}>
            Skip to the real game
          </Button>
          <Button className="px-5" onClick={onPractice}>
            Start practice round
          </Button>
        </div>
      </Card>
    </Overlay>
  );
}
