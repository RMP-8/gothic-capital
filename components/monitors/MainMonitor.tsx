"use client";

import { useMemo } from "react";
import { Area, AreaChart, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from "recharts";
import type { GameState } from "@/lib/types";
import { longDate, money, num, pct, shortDate } from "@/lib/format";
import { shownDate } from "@/lib/engine";
import { Monitor } from "@/components/ui";

const COL_W = 276;
const CHART_H = 282;
const PHONE_H = 190;

type Row = { date: string; price: number; value: number; bnh: number };

function TipBox({ children }: { children: React.ReactNode }) {
  return <div className="rounded-md border border-ink/15 bg-white px-2.5 py-1.5 text-[11px] text-ink shadow-lg">{children}</div>;
}

function PriceTip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as Row;
  return (
    <TipBox>
      <div className="text-ink-2">{longDate(row.date)}</div>
      <div className="tabular font-semibold">${num(row.price)}</div>
    </TipBox>
  );
}

function ValueTip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as Row;
  return (
    <TipBox>
      <div className="text-ink-2">{longDate(row.date)}</div>
      <div className="tabular">
        <span className="text-royal">You</span> {money(row.value)}
      </div>
      <div className="tabular">
        <span className="text-ink-2">Buy & hold</span> {money(row.bnh)}
      </div>
    </TipBox>
  );
}

const axisTick = { fill: "#6b7a93", fontSize: 10.5 };

/** Fixed-size on the desk; fills its container on a phone. */
function Sized({ compact, children }: { compact: boolean; children: React.ReactElement }) {
  if (!compact) return children;
  return (
    <ResponsiveContainer width="100%" height={PHONE_H}>
      {children}
    </ResponsiveContainer>
  );
}

export default function MainMonitor({ state, compact = false }: { state: GameState; compact?: boolean }) {
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
  const dims = compact ? {} : { width: COL_W, height: CHART_H };

  return (
    <Monitor
      title={`${state.ticker} · weekly, adjusted close`}
      right={
        <span className="text-[10px] text-ink-2">
          {state.dateOffset ? `real prices from ${shortDate(state.data.prices[0].date)} · ` : ""}
          {state.data.source === "snapshot" ? "backup snapshot" : "live data"}
        </span>
      }
    >
      <div className={`flex h-full ${compact ? "flex-col overflow-y-auto" : ""}`}>
        {/* price */}
        <div className="flex flex-1 flex-col px-2 pt-1.5">
          <div className="flex items-baseline justify-between px-1">
            <span className="tabular text-[19px] font-semibold leading-none">${num(price)}</span>
            <span className={`tabular text-[12px] ${priceChange >= 0 ? "text-gain" : "text-loss"}`}>{pct(priceChange)} wk</span>
          </div>
          <Sized compact={compact}>
            <AreaChart accessibilityLayer={false} {...dims} data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="mm-price" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#00539b" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#00539b" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" ticks={xTicks} tickFormatter={shortDate} tick={axisTick} axisLine={{ stroke: "rgba(11,30,77,0.12)" }} tickLine={false} interval={0} />
              <YAxis domain={["auto", "auto"]} width={38} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${Math.round(v)}`} />
              <Tooltip content={PriceTip} cursor={{ stroke: "rgba(11,30,77,0.25)" }} />
              <Area type="monotone" dataKey="price" stroke="#00539b" strokeWidth={1.8} fill="url(#mm-price)" isAnimationActive={false} dot={false} />
            </AreaChart>
          </Sized>
        </div>
        <div className={compact ? "mx-2 my-1 h-px bg-ink/10" : "my-2 w-px bg-ink/10"} />
        {/* portfolio vs buy & hold */}
        <div className="flex flex-1 flex-col px-2 pt-1.5">
          <div className="flex items-center justify-between px-1 text-[11.5px]">
            <span className="flex items-center gap-1">
              <i className="inline-block h-[3px] w-3 rounded bg-royal" />
              <span>You</span>
              <span className="tabular text-ink-2">{money(state.history[state.week])}</span>
            </span>
            <span className="flex items-center gap-1">
              <i className="inline-block h-[3px] w-3 rounded bg-[#8b98ab]" />
              <span className="text-ink-2">B&amp;H</span>
              <span className="tabular text-ink-2">{money(state.bnhHistory[state.week])}</span>
            </span>
            <span className={`tabular ${lead >= 0 ? "text-gain" : "text-loss"}`}>
              {lead >= 0 ? "+" : "−"}
              {money(Math.abs(lead))}
            </span>
          </div>
          <Sized compact={compact}>
            <LineChart accessibilityLayer={false} {...dims} data={rows} margin={{ top: 8, right: 4, left: 0, bottom: 0 }}>
              <XAxis dataKey="date" ticks={xTicks} tickFormatter={shortDate} tick={axisTick} axisLine={{ stroke: "rgba(11,30,77,0.12)" }} tickLine={false} interval={0} />
              <YAxis domain={["auto", "auto"]} width={38} tick={axisTick} axisLine={false} tickLine={false} tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`} />
              <Tooltip content={ValueTip} cursor={{ stroke: "rgba(11,30,77,0.25)" }} />
              <Line type="monotone" dataKey="bnh" stroke="#8b98ab" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="value" stroke="#00539b" strokeWidth={2.2} dot={false} isAnimationActive={false} />
            </LineChart>
          </Sized>
        </div>
      </div>
    </Monitor>
  );
}
