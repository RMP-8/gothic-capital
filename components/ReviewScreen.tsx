"use client";

import { useMemo } from "react";
import { motion } from "framer-motion";
import { Line, LineChart, Tooltip, XAxis, YAxis, type TooltipContentProps, type TooltipValueType } from "recharts";
import type { GameState } from "@/lib/types";
import { STARTING_CASH } from "@/lib/types";
import { computeStats, type PerformanceStats } from "@/lib/metrics";
import { FOUNDER_NAME } from "@/lib/messages";
import { longDate, money, num, pct, pctPlain, shortDate } from "@/lib/format";
import ConferenceRoom from "@/components/office/ConferenceRoom";
import { Button, FounderAvatar } from "@/components/ui";

export function closingLine(player: PerformanceStats, bnh: PerformanceStats): string {
  const beat = player.endValue > bnh.endValue;
  if (beat && player.sharpe >= bnh.sharpe) return "You beat the market with less risk. Your office just got a bigger window.";
  if (beat) return "You beat buy-and-hold, with a little more drama along the way. Not bad for five years.";
  if (player.maxDrawdown < bnh.maxDrawdown) return "Buy-and-hold edged you out, but you slept better than the market did. There's a career in that.";
  return "The market won this round. It usually does. Now you know exactly why we respect the gray line.";
}

function Tip({ active, payload }: TooltipContentProps<TooltipValueType, string | number>) {
  if (!active || !payload?.length) return null;
  const row = payload[0].payload as { date: string; value: number; bnh: number };
  return (
    <div className="rounded-md border border-white/10 bg-[#0a1a45] px-2.5 py-1.5 text-[11px] text-white shadow-lg">
      <div className="text-silver/70">{longDate(row.date)}</div>
      <div className="tabular">
        <span className="text-royal-bright">You</span> {money(row.value)}
      </div>
      <div className="tabular">
        <span className="text-silver">Buy & hold</span> {money(row.bnh)}
      </div>
    </div>
  );
}

export default function ReviewScreen({
  state,
  onPlayAgain,
  onNewTicker,
}: {
  state: GameState;
  onPlayAgain: () => void;
  onNewTicker: () => void;
}) {
  const player = useMemo(() => computeStats(state.history, state.rates), [state]);
  const bnh = useMemo(() => computeStats(state.bnhHistory, state.rates), [state]);
  const rows = useMemo(
    () => state.history.map((value, i) => ({ date: state.data.prices[i].date, value, bnh: state.bnhHistory[i] })),
    [state],
  );
  const ticks = useMemo(() => [0, 0.25, 0.5, 0.75, 1].map((f) => rows[Math.round(f * (rows.length - 1))].date), [rows]);
  const totalBonus = state.bonuses.reduce((a, b) => a + b.amount, 0);
  const beat = player.endValue > bnh.endValue;

  const metrics: { label: string; you: string; bnh: string; better: boolean; why: string }[] = [
    {
      label: "Sharpe ratio",
      you: num(player.sharpe),
      bnh: num(bnh.sharpe),
      better: player.sharpe >= bnh.sharpe,
      why: "Return earned per unit of risk: weekly returns minus the T-bill rate, divided by their volatility, annualized by √52.",
    },
    {
      label: "Max drawdown",
      you: player.maxDrawdown > 0 ? `-${pctPlain(player.maxDrawdown)}` : "0.0%",
      bnh: bnh.maxDrawdown > 0 ? `-${pctPlain(bnh.maxDrawdown)}` : "0.0%",
      better: player.maxDrawdown <= bnh.maxDrawdown,
      why: "The biggest drop from a peak to a later low. Smaller is better.",
    },
    {
      label: "IRR (yearly return)",
      you: pct(player.irr),
      bnh: pct(bnh.irr),
      better: player.irr >= bnh.irr,
      why: "The yearly return on the money invested: (ending ÷ starting value) ^ (1 ÷ years) − 1.",
    },
  ];

  return (
    <>
      <ConferenceRoom />
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: [0.2, 0.8, 0.2, 1] }}
        className="absolute rounded-2xl border border-white/10 bg-[#071537]/92 p-6 text-white shadow-[0_40px_120px_rgba(0,0,0,0.6)] backdrop-blur-sm"
        style={{ left: 190, top: 60, width: 1220, height: 600 }}
      >
        <div className="flex items-start gap-4">
          <FounderAvatar size={48} />
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-[0.25em] text-silver/60">Performance review · {state.ticker}</div>
            <h1 className="mt-0.5 text-[24px] font-semibold leading-tight">&ldquo;{closingLine(player, bnh)}&rdquo;</h1>
            <div className="mt-1 text-[12px] text-silver/70">{FOUNDER_NAME}, Founder</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-[11px] uppercase tracking-[0.18em] text-silver/55">Final title</div>
            <div className="text-[20px] font-semibold">{state.title}</div>
            <div className="tabular mt-1 text-[12px] text-silver/70">Bonuses earned: {money(totalBonus)}</div>
          </div>
        </div>

        <div className="mt-4 flex gap-5">
          <div className="w-[640px] rounded-xl bg-navy-deep/80 p-3">
            <div className="flex items-center gap-4 px-1 text-[12px]">
              <span className="flex items-center gap-1.5">
                <i className="inline-block h-[3px] w-4 rounded bg-royal-bright" /> You
                <span className={`tabular ${beat ? "text-gain" : "text-loss"}`}>
                  {money(player.endValue)} ({pct(player.totalReturn)})
                </span>
              </span>
              <span className="flex items-center gap-1.5">
                <i className="inline-block h-[3px] w-4 rounded bg-silver" /> Buy &amp; hold
                <span className="tabular text-silver">
                  {money(bnh.endValue)} ({pct(bnh.totalReturn)})
                </span>
              </span>
              <span className="ml-auto text-silver/55">
                {longDate(rows[0].date)} → {longDate(rows[rows.length - 1].date)}
              </span>
            </div>
            <LineChart accessibilityLayer={false} width={616} height={300} data={rows} margin={{ top: 14, right: 10, left: 0, bottom: 0 }}>
              <XAxis
                dataKey="date"
                ticks={ticks}
                interval={0}
                tickFormatter={shortDate}
                tick={{ fill: "#8b98ab", fontSize: 10 }}
                axisLine={{ stroke: "rgba(255,255,255,0.08)" }}
                tickLine={false}
              />
              <YAxis
                domain={["auto", "auto"]}
                width={50}
                tick={{ fill: "#8b98ab", fontSize: 10 }}
                axisLine={false}
                tickLine={false}
                tickFormatter={(v: number) => `$${Math.round(v / 1000)}k`}
              />
              <Tooltip content={Tip} cursor={{ stroke: "rgba(255,255,255,0.2)" }} />
              <Line type="monotone" dataKey="bnh" stroke="#c9d1db" strokeWidth={1.5} dot={false} isAnimationActive={false} />
              <Line type="monotone" dataKey="value" stroke="#1b6fc2" strokeWidth={2.4} dot={false} isAnimationActive={false} />
            </LineChart>
          </div>
          <div className="flex flex-1 flex-col gap-3">
            {metrics.map((m, i) => (
              <motion.div
                key={m.label}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
              >
                <div className="flex items-baseline justify-between">
                  <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-silver/60">{m.label}</span>
                  <span className={`text-[10px] ${m.better ? "text-gain" : "text-loss"}`}>{m.better ? "you win" : "buy & hold wins"}</span>
                </div>
                <div className="mt-1 flex items-baseline gap-5">
                  <div>
                    <div className="tabular text-[24px] font-semibold leading-none">{m.you}</div>
                    <div className="text-[10px] text-silver/55">you</div>
                  </div>
                  <div>
                    <div className="tabular text-[18px] font-medium leading-none text-silver">{m.bnh}</div>
                    <div className="text-[10px] text-silver/55">buy &amp; hold</div>
                  </div>
                </div>
                <p className="mt-1.5 text-[11.5px] leading-snug text-silver/80">{m.why}</p>
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mt-4 flex items-center gap-3">
          <span className="text-[12px] text-silver/60">
            Started with {money(STARTING_CASH)} · {state.tradeCount} trade{state.tradeCount === 1 ? "" : "s"} over {num(player.years, 1)} years
          </span>
          <div className="ml-auto flex gap-2">
            <Button variant="ghost" onClick={onNewTicker}>
              Try a different ticker
            </Button>
            <Button className="px-5" onClick={onPlayAgain}>
              Play again
            </Button>
          </div>
        </div>
      </motion.div>
    </>
  );
}
