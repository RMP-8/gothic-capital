"use client";

import type { GameState } from "@/lib/types";
import { shownDate, totalWeeks, weekChange } from "@/lib/engine";
import { longDate, money, pct } from "@/lib/format";
import type { Speed } from "@/components/Controls";
import { Button } from "@/components/ui";

export type MobileTab = "chart" | "trade" | "inbox" | "lesson" | "list";

export function MobileHeader({ state, badge, label }: { state: GameState; badge: boolean; label?: string }) {
  const change = weekChange(state);
  return (
    <header className="sticky top-0 z-20 border-b border-white/10 bg-[#071537]/95 px-4 pb-2 pt-3 pr-16 backdrop-blur">
      <div className="flex items-center gap-2">
        <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-royal-bright">Gothic Capital</span>
        {label && <span className="rounded-full border border-white/30 bg-royal px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.18em]">{label}</span>}
        {badge && (
          <span className="flex items-center gap-1 rounded-full border border-gain/50 bg-gain/15 px-2 py-0.5 text-[9px] font-semibold uppercase tracking-[0.15em] text-white">
            <span className="flex h-3 w-3 items-center justify-center rounded-full bg-gain text-[8px]">✓</span> Trained
          </span>
        )}
      </div>
      <div className="mt-0.5 flex items-baseline justify-between">
        <span className="text-[15px] font-semibold">
          {state.ticker} <span className="text-[12px] font-normal text-silver/70">· {state.title}</span>
        </span>
        <span className="tabular text-[11px] text-silver/70">
          {longDate(shownDate(state, state.data.prices[state.week].date))} · wk {state.week + 1}/{totalWeeks(state)}
        </span>
      </div>
      <div className="tabular mt-1 grid grid-cols-3 gap-2 text-[12px]">
        <div>
          <div className="text-[9px] uppercase tracking-[0.15em] text-silver/55">Cash</div>
          <div className="font-semibold">{money(state.cash)}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.15em] text-silver/55">Portfolio</div>
          <div className="font-semibold">{money(state.history[state.week])}</div>
        </div>
        <div>
          <div className="text-[9px] uppercase tracking-[0.15em] text-silver/55">This week</div>
          <div className={`font-semibold ${change > 0 ? "text-gain" : change < 0 ? "text-loss" : "text-silver"}`}>{pct(change)}</div>
        </div>
      </div>
    </header>
  );
}

export function MobileTabs({ tabs, value, onChange, badges }: { tabs: { id: MobileTab; label: string }[]; value: MobileTab; onChange: (t: MobileTab) => void; badges?: Partial<Record<MobileTab, number>> }) {
  return (
    <nav className="grid grid-cols-3 border-b border-white/10 bg-[#071537]">
      {tabs.map((t) => (
        <button
          key={t.id}
          type="button"
          data-tab={t.id}
          onClick={() => onChange(t.id)}
          className={`relative py-2.5 text-[13px] font-medium transition-colors ${value === t.id ? "border-b-2 border-royal-bright text-white" : "text-silver/70"}`}
        >
          {t.label}
          {badges?.[t.id] ? <span className="ml-1.5 rounded-full bg-royal px-1.5 py-0.5 text-[10px] text-white">{badges[t.id]}</span> : null}
        </button>
      ))}
    </nav>
  );
}

export interface MobileBarProps {
  mode: "playing" | "practice" | "training" | "finished";
  autoplay: boolean;
  speed: Speed;
  sound: boolean;
  onNext: () => void;
  onSkip: () => void;
  onToggleAutoplay: () => void;
  onSpeed: (s: Speed) => void;
  onToggleSound: () => void;
  onAskFounder: () => void;
  onReview: () => void;
  onLevels: () => void;
  onSkipToPractice: () => void;
}

export function MobileBar(p: MobileBarProps) {
  const nextSpeed: Record<Speed, Speed> = { 1: 2, 2: 4, 4: 1 };
  return (
    <div className="fixed inset-x-0 bottom-0 z-30 border-t border-white/10 bg-[#071537]/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur">
      {p.mode === "finished" ? (
        <Button className="w-full py-3 text-[15px]" onClick={p.onReview}>
          Go to your review
        </Button>
      ) : p.mode === "training" ? (
        <div className="flex gap-2">
          <Button variant="ghost" className="flex-1 py-2.5" onClick={p.onLevels}>
            Back to levels
          </Button>
          <Button variant="ghost" className="flex-1 py-2.5" onClick={p.onSkipToPractice}>
            Skip to Level 2
          </Button>
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <Button data-spot="next" className="flex-[1.3] py-2.5 text-[14px] whitespace-nowrap" onClick={p.onNext}>
            Next week →
          </Button>
          <Button data-spot="skip" variant="ghost" className="flex-1 py-2.5 whitespace-nowrap" onClick={p.onSkip}>
            Skip 4
          </Button>
          <Button
            variant={p.autoplay ? "loss" : "ghost"}
            className="py-2.5 whitespace-nowrap"
            disabled={p.mode === "practice"}
            onClick={p.onToggleAutoplay}
            title={p.mode === "practice" ? "Auto-play is off during practice" : undefined}
          >
            {p.autoplay ? "■" : "▶"}
          </Button>
          <Button variant="ghost" className="tabular py-2.5" disabled={p.mode === "practice"} onClick={() => p.onSpeed(nextSpeed[p.speed])}>
            {p.speed}×
          </Button>
          <button type="button" onClick={p.onAskFounder} aria-label="Ask the founder" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-royal-bright to-royal text-[12px] font-semibold">
            EV
          </button>
          <button type="button" onClick={p.onToggleSound} aria-label={p.sound ? "Mute sounds" : "Unmute sounds"} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md border border-white/10 bg-white/5 text-silver">
            {p.sound ? "🔊" : "🔇"}
          </button>
        </div>
      )}
    </div>
  );
}
