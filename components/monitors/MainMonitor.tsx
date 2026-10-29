"use client";

import { useMemo } from "react";
import { Area, AreaChart, Line, LineChart, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from "recharts";
import type { GameState } from "@/lib/types";
import { longDate, money, num, pct, shortDate } from "@/lib/format";
import { shownDate } from "@/lib/engine";
import { Monitor } from "@/components/ui";

const COL_W = 258;
const CHART_H = 258;

type Row = { date: string; price: number; value: number; bnh: number };

function TipBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-white/10 bg-[#0a1a45] px-2.5 py-1.5 text-[11px] text-white shadow-lg">{children}</div>;
}

function PriceTip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as Row;
  return (
    <TipBox>
      <div className="text-silver/70">{longDate(row.date)}</div>
      <div className="tabular font-semibold">${num(row.price)}</div>
    </TipBox>
  );
}

function ValueTip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as Row;
  return (
    <TipBox>
      <div className="text-silver/70">{longDate(row.date)}</div>
      <div className="tabular">
        <span className="text-royal-bright">You</span> {money(row.value)}
      </div>
      <div className="tabular">
        <span className="text-silver">Buy & hold</span> {money(row.bnh)}
      </div>
    </TipBox>
  );
}

const axisTick = { fill: "#8b98ab", fontSize: 10 };

export default function MainMonitor({ state }: { state: GameState }) {
  const rows = useMemo<Row[]>(
    () =>
      state.history.map((value, i) => ({
        date: shownDate(state, state.data.prices[i].date),
        price: state.data.prices[i].close,
        value,
        bnh: state.bnhHistory[i],
      })),
    [state],
  );
  const price = state.data.prices[state.week].close;
  const prevPrice = state.week > 0 ? state.data.prices[state.week - 1].close : price;
  const priceChange = prevPrice > 0 ? price / prevPrice - 1 : 0;
  const lead = state.history[state.week] - state.bnhHistory[state.week];
  const xTicks = useMemo(() => {
    const n = rows.length;
    if (n < 2) return rows.map((r) => r.date);
    const count = Math.min(4, n);
    const out: string[] = [];
    for (let i = 0; i < count; i++) out.push(rows[Math.round((i * (n - 1)) / (count - 1))].date);
    return out;
  }, [rows]);

  return (
    <Monitor
      title={`${state.ticker} · weekly, adjusted close`}
      right={
        <span className="text-[10px] text-silver/70">
          {state.dateOffset ? `real prices from ${shortDate(state.data.prices[0].date)} · ` : ""}
          {state.data.source === "snapshot" ? "backup snapshot" : "live data"}
        </span>
      }
    >
      <div className="flex h-full">
        {/* price */}
        <div className="flex flex-1 flex-col px-2 pt-1.5">
          <div className="flex items-baseline justify-between px-1">
            <span className="tabular text-[19px] font-semibold leading-none">${num(price)}</span>
            <span className={`tabular text-[12px] ${priceChange >= 0 ? "text-gain" : "text-loss"}`}>{pct(priceChange)} wk</span>
          </div>
          <AreaChart accessibilityLayer={false} width={COL_W} height={CHART_H} data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="mm-price" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#8fb8e8" stopOpacity={0.35} />
                <stop offset="100%" stopColor="#8fb8e8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" ticks={xTicks} tickFormatter={shortDate} tick={axisTick} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} interval={0} />
            <YAxis domain={["auto", "auto"]} width={38} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${Math.round(v)}`} />
            <Tooltip content={PriceTip} cursor={{ stroke: "rgba(255,255,255,0.2)" }} />
            <Area type="monotone" dataKey="price" stroke="#cfe2f7" strokeWidth={1.5} fill="url(#mm-price)" isAnimationActive={false} dot={false} />
          </AreaChart>
        </div>
        <div className="my-2 w-px bg-white/10" />
        {/* portfolio vs buy & hold */}
        <div className="flex flex-1 flex-col px-2 pt-1.5">
          <div className="flex items-center justify-between px-1 text-[11.5px]">
            <span className="flex items-center gap-1">
              <i className="inline-block h-[3px] w-3 rounded bg-royal-bright" />
              <span>You</span>
              <span className="tabular text-silver/80">{money(state.history[state.week])}</span>
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-[3px] w-3 rounded bg-silver" />
              <span className="text-silver">B&amp;H</span>
              <span className="tabular text-silver/80">{money(state.bnhHistory[state.week])}</span>
            </span>
            <span className={`tabular ${lead >= 0 ? "text-gain" : "text-loss"}`}>
              {lead >= 0 ? "+" : "−"}
              {money(Math.abs(lead))}
            </span>
          </div>
          <LineChart accessibilityLayer={false} width={COL_W} height={CHART_H} data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
            <XAxis dataKey="date" ticks={xTicks} tickFormatter={shortDate} tick={axisTick} axisLine={{ stroke: "rgba(255,255,255,0.08)" }} tickLine={false} interval={0} />
            <YAxis domain={["auto", "auto"]} width={38} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
            <Tooltip content={ValueTip} cursor={{ stroke: "rgba(255,255,255,0.2)" }} />
            <Line type="monotone" dataKey="bnh" stroke="#c9d1db" strokeWidth={1.3} dot={false} isAnimationActive={false} />
            <Line type="monotone" dataKey="value" stroke="#1b6fc2" strokeWidth={2} dot={false} isAnimationActive={false} style={{ filter: "drop-shadow(0 0 4px rgba(27,111,194,0.7))" }} />
          </LineChart>
        </div>
      </div>
    </Monitor>
  );
}
