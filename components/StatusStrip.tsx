"use client";

import type { GameState } from "@/lib/types";
import { totalWeeks, weekChange } from "@/lib/engine";
import { longDate, money, pct } from "@/lib/format";

function Cell({ label, value, className = "" }: { label: string; value: string; className?: string }) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-[10px] uppercase tracking-[0.18em] text-silver/55">{label}</span>
      <span className={`tabular text-[13px] font-semibold ${className}`}>{value}</span>
    </div>
  );
}

export default function StatusStrip({ state }: { state: GameState }) {
  const change = weekChange(state);
  return (
    <div
      className="absolute flex items-center justify-between rounded-[6px] border border-white/10 px-6 text-white"
      style={{ left: 40, top: 866, width: 1520, height: 30, background: "linear-gradient(180deg, #0a1b47, #061231)", boxShadow: "inset 0 1px 0 rgba(255,255,255,0.08), 0 2px 6px rgba(0,0,0,0.3)" }}
    >
      <Cell label="Date" value={longDate(state.data.prices[state.week].date)} />
      <Cell label="Week" value={`${state.week + 1} / ${totalWeeks(state)}`} />
      <Cell label="Cash" value={money(state.cash)} />
      <Cell label="Portfolio" value={money(state.history[state.week])} />
      <Cell
        label="This week"
        value={pct(change)}
        className={change > 0 ? "text-gain" : change < 0 ? "text-loss" : "text-silver"}
      />
    </div>
  );
}
