"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import type { ExpiryWeeks, GameState, OptionOrder, OptionType, StrikeMode } from "@/lib/types";
import { maxBuyableShares, quoteOption, spot, totalWeeks } from "@/lib/engine";
import { money, money2, num, pct } from "@/lib/format";
import { Button, Monitor, Segmented } from "@/components/ui";

type Tab = "shares" | "call" | "put";

export interface SideMonitorProps {
  state: GameState;
  onBuyShares: (n: number) => void;
  onSellShares: (n: number) => void;
  onPreviewOption: (order: OptionOrder) => void;
  onSellOption: (id: string) => void;
  error: string | null;
  onTabChange?: (tab: "shares" | "call" | "put") => void;
}

const input = "tabular h-7 rounded border border-white/15 bg-white/5 px-1.5 text-[13px] text-white outline-none focus:border-royal-bright";

export default function SideMonitor({ state, onBuyShares, onSellShares, onPreviewOption, onSellOption, error, onTabChange }: SideMonitorProps) {
  const [tab, setTab] = useState<Tab>("shares");
  const [qty, setQty] = useState("10");
  const [contracts, setContracts] = useState("1");
  const [expiryChoice, setExpiry] = useState<ExpiryWeeks>(4);
  const [strikeMode, setStrikeMode] = useState<StrikeMode>("atm");

  const price = spot(state);
  const n = Math.max(0, Math.floor(Number(qty) || 0));
  const c = Math.max(0, Math.floor(Number(contracts) || 0));
  const playing = state.status === "playing";
  const weeksLeft = totalWeeks(state) - 1 - state.week;
  // Near the end of the game a 12-week option would outlive the simulation.
  const expiry: ExpiryWeeks = weeksLeft < 12 && expiryChoice === 12 ? 4 : expiryChoice;
  const optionType: OptionType = tab === "put" ? "put" : "call";
  const quote = useMemo(
    () => (tab === "shares" ? null : quoteOption(state, { type: optionType, expiryWeeks: expiry, strikeMode, contracts: Math.max(1, c) })),
    [state, tab, optionType, expiry, strikeMode, c],
  );
  const sharesPnl = state.shares > 0 ? (price - state.avgCost) * state.shares : 0;

  return (
    <Monitor title="Order ticket" right={<span className="tabular text-[10px] text-silver/70">cash {money(state.cash)}</span>}>
      <div className="flex h-full">
        {/* ---- ticket ---- */}
        <div className="flex w-[236px] shrink-0 flex-col px-2.5 pt-2">
          <Segmented
            value={tab}
            onChange={(t) => {
              setTab(t);
              onTabChange?.(t);
            }}
            options={[
              { value: "shares", label: "Shares", spot: "shares" },
              { value: "call", label: "Call", spot: "call" },
              { value: "put", label: "Put", spot: "put" },
            ]}
          />
          {tab === "shares" ? (
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center gap-1.5">
                <label className="text-[12px] text-silver/70">Shares</label>
                <input type="number" min={1} value={qty} onChange={(e) => setQty(e.target.value)} className={`${input} w-14`} />
                <button type="button" onClick={() => setQty(String(maxBuyableShares(state)))} className="text-[12px] text-royal-bright hover:underline">
                  max {maxBuyableShares(state)}
                </button>
              </div>
              <div className="tabular text-[12px] text-silver/70">≈ {money(n * price)}</div>
              <div className="flex gap-1.5">
                <Button data-spot="buy" variant="gain" className="flex-1 px-2 py-1.5 text-[13px]" disabled={!playing || n < 1 || n * price > state.cash + 1e-9} onClick={() => onBuyShares(n)}>
                  Buy
                </Button>
                <Button data-spot="sell" variant="loss" className="flex-1 px-2 py-1.5 text-[13px]" disabled={!playing || n < 1 || n > state.shares} onClick={() => onSellShares(n)}>
                  Sell
                </Button>
              </div>
              <p className="text-[11px] leading-snug text-silver/55">Own a piece of {state.ticker}. No borrowing, no short selling.</p>
            </div>
          ) : (
            <div className="mt-2.5 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-silver/70">Expires</span>
                <Segmented
                  value={String(expiry) as "4" | "12"}
                  onChange={(v) => setExpiry(Number(v) as ExpiryWeeks)}
                  options={[
                    { value: "4", label: "4 wks" },
                    { value: "12", label: "12 wks" },
                  ]}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-silver/70">Strike</span>
                <Segmented
                  value={strikeMode}
                  onChange={setStrikeMode}
                  options={[
                    { value: "down5", label: "−5%" },
                    { value: "atm", label: "At price" },
                    { value: "up5", label: "+5%" },
                  ]}
                />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[12px] text-silver/70">Contracts (100 sh)</span>
                <input type="number" min={1} value={contracts} onChange={(e) => setContracts(e.target.value)} className={`${input} w-12`} />
              </div>
              {quote && (
                <div className="flex items-center justify-between rounded bg-white/[0.04] px-1.5 py-1 text-[12px]">
                  <span className="text-silver/70">
                    K ${num(quote.strike)} · {money2(quote.premiumPerShare)}/sh
                  </span>
                  <span className="tabular font-semibold text-white">{money(quote.totalCost)}</span>
                </div>
              )}
              <Button
                data-spot="preview"
                className="w-full px-2 py-1.5 text-[13px]"
                disabled={!playing || c < 1 || !quote || quote.totalCost > state.cash + 1e-9 || weeksLeft < expiry}
                onClick={() => onPreviewOption({ type: optionType, expiryWeeks: expiry, strikeMode, contracts: c })}
              >
                Preview {optionType} &amp; buy
              </Button>
            </div>
          )}
          <AnimatePresence>
            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="mt-1 text-[12px] leading-snug text-loss">
                {error}
              </motion.p>
            )}
          </AnimatePresence>
        </div>

        {/* ---- positions ---- */}
        <div className="my-2 w-px bg-white/10" />
        <div data-spot="positions" className="flex min-w-0 flex-1 flex-col">
          <div className="px-2 pt-1.5 text-[10px] font-semibold uppercase tracking-[0.18em] text-silver/60">Positions</div>
          <div className="monitor-scroll min-h-0 flex-1 overflow-y-auto px-2 pb-2">
            {state.shares === 0 && state.options.length === 0 && <p className="mt-1.5 text-[12px] text-silver/50">All cash. Nothing on the books yet.</p>}
            {state.shares > 0 && (
              <div className="mt-1.5 rounded bg-white/[0.04] px-1.5 py-1 text-[12px]">
                <div className="flex justify-between">
                  <span className="font-semibold text-white">
                    {state.shares} {state.ticker}
                  </span>
                  <span className="tabular text-white">{money(state.shares * price)}</span>
                </div>
                <div className="flex justify-between text-silver/60">
                  <span>avg {money2(state.avgCost)}</span>
                  <span className={`tabular ${sharesPnl >= 0 ? "text-gain" : "text-loss"}`}>
                    {money(sharesPnl)} ({pct(state.avgCost > 0 ? price / state.avgCost - 1 : 0)})
                  </span>
                </div>
              </div>
            )}
            <AnimatePresence initial={false}>
              {state.options.map((o) => {
                const left = o.expiryWeek - state.week;
                const pnl = o.value - o.premiumPaid;
                return (
                  <motion.div key={o.id} initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: 20 }} className="mt-1.5 rounded bg-white/[0.04] px-1.5 py-1 text-[12px]">
                    <div className="flex justify-between">
                      <span className="font-semibold capitalize text-white">
                        {o.contracts} {o.type}
                        {o.contracts > 1 ? "s" : ""} · ${num(o.strike)}
                      </span>
                      <span className="tabular text-white">{money(o.value)}</span>
                    </div>
                    <div className="flex items-center justify-between text-silver/60">
                      <span>
                        {left} wk{left === 1 ? "" : "s"} left · <span className={pnl >= 0 ? "text-gain" : "text-loss"}>{money(pnl)}</span>
                      </span>
                      <Button variant="ghost" className="px-1.5 py-0.5 text-[10px]" disabled={!playing} onClick={() => onSellOption(o.id)}>
                        Sell
                      </Button>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </Monitor>
  );
}
