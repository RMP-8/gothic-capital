"use client";

import { useMemo } from "react";
import type { OptionQuote } from "@/lib/types";
import { CONTRACT_SIZE } from "@/lib/types";
import { intrinsic } from "@/lib/blackScholes";
import { money, money2, num, pctPlain } from "@/lib/format";
import { Button, Card, Overlay } from "@/components/ui";

const W = 440;
const H = 190;
const PAD = { l: 44, r: 16, t: 14, b: 26 };

export default function OptionPreview({
  quote,
  onConfirm,
  onCancel,
}: {
  quote: OptionQuote;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  const chart = useMemo(() => {
    const lo = quote.spot * 0.8;
    const hi = quote.spot * 1.2;
    const mult = CONTRACT_SIZE * quote.contracts;
    const pts: { x: number; y: number }[] = [];
    for (let i = 0; i <= 80; i++) {
      const S = lo + ((hi - lo) * i) / 80;
      pts.push({ x: S, y: (intrinsic(quote.type, S, quote.strike) - quote.premiumPerShare) * mult });
    }
    const ys = pts.map((p) => p.y);
    const yMin = Math.min(...ys);
    const yMax = Math.max(...ys, 1);
    const sx = (x: number) => PAD.l + ((x - lo) / (hi - lo)) * (W - PAD.l - PAD.r);
    const sy = (y: number) => PAD.t + (1 - (y - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);
    return {
      lo,
      hi,
      sx,
      sy,
      path: pts.map((p, i) => `${i ? "L" : "M"}${sx(p.x).toFixed(1)},${sy(p.y).toFixed(1)}`).join(" "),
      zeroY: sy(0),
      yMin,
      yMax,
    };
  }, [quote]);

  const isCall = quote.type === "call";
  return (
    <Overlay onClose={onCancel}>
      <Card className="w-[520px] p-6">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-silver/60">Before you buy</div>
        <h2 className="text-[20px] font-semibold capitalize">
          {quote.contracts} {quote.type} contract{quote.contracts > 1 ? "s" : ""} · ${num(quote.strike)} strike · {quote.expiryWeeks} weeks
        </h2>
        <p className="mt-1.5 text-[13px] leading-snug text-silver">
          {isCall
            ? `The right to buy ${CONTRACT_SIZE * quote.contracts} shares at $${num(quote.strike)} any time in the next ${quote.expiryWeeks} weeks. You profit if the price ends above your break-even.`
            : `The right to sell ${CONTRACT_SIZE * quote.contracts} shares at $${num(quote.strike)} any time in the next ${quote.expiryWeeks} weeks. You profit if the price ends below your break-even.`}
        </p>

        <div className="mt-4 grid grid-cols-3 gap-3">
          <Stat label="Cost (premium)" value={money(quote.totalCost)} sub={`${money2(quote.premiumPerShare)} per share`} />
          <Stat label="Break-even" value={`$${num(quote.breakEven)}`} sub={`${isCall ? "above" : "below"} today's $${num(quote.spot)}`} />
          <Stat label="Max loss" value={money(quote.maxLoss)} sub="the premium, never more" tone="loss" />
        </div>

        <div className="mt-4 rounded-lg bg-navy-deep/80 p-2">
          <div className="mb-1 px-2 text-[10px] uppercase tracking-[0.18em] text-silver/55">
            Profit or loss at expiry, by {quote.type === "call" ? "stock" : "stock"} price
          </div>
          <svg width={W} height={H} className="block">
            <line x1={PAD.l} x2={W - PAD.r} y1={chart.zeroY} y2={chart.zeroY} stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
            <path d={chart.path} fill="none" stroke="#1b6fc2" strokeWidth={2.4} />
            {/* current price */}
            <line x1={chart.sx(quote.spot)} x2={chart.sx(quote.spot)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(201,209,219,0.35)" />
            <text x={chart.sx(quote.spot)} y={H - 8} textAnchor="middle" fontSize={10} fill="#c9d1db">
              today ${num(quote.spot, 0)}
            </text>
            {/* break-even */}
            <circle cx={chart.sx(quote.breakEven)} cy={chart.zeroY} r={4} fill="#ffffff" />
            <text x={chart.sx(quote.breakEven)} y={chart.zeroY - 8} textAnchor="middle" fontSize={10} fill="#ffffff">
              break-even ${num(quote.breakEven, 0)}
            </text>
            <text x={PAD.l - 6} y={PAD.t + 8} textAnchor="end" fontSize={10} fill="#4cae7c">
              {money(chart.yMax)}
            </text>
            <text x={PAD.l - 6} y={H - PAD.b} textAnchor="end" fontSize={10} fill="#d1605e">
              {money(chart.yMin)}
            </text>
            <text x={PAD.l} y={H - 8} fontSize={10} fill="#8b98ab">
              ${num(chart.lo, 0)}
            </text>
            <text x={W - PAD.r} y={H - 8} textAnchor="end" fontSize={10} fill="#8b98ab">
              ${num(chart.hi, 0)}
            </text>
          </svg>
        </div>
        <p className="mt-2 text-[11px] text-silver/60">
          Priced with Black-Scholes: recent volatility {pctPlain(quote.sigma, 0)} a year, T-bill rate {num(quote.rate)}%.
        </p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="ghost" onClick={onCancel}>
            Not now
          </Button>
          <Button className="px-5" onClick={onConfirm}>
            Buy for {money(quote.totalCost)}
          </Button>
        </div>
      </Card>
    </Overlay>
  );
}

function Stat({ label, value, sub, tone }: { label: string; value: string; sub: string; tone?: "loss" }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.03] px-3 py-2">
      <div className="text-[10px] uppercase tracking-[0.18em] text-silver/55">{label}</div>
      <div className={`tabular mt-0.5 text-[18px] font-semibold ${tone === "loss" ? "text-loss" : "text-white"}`}>{value}</div>
      <div className="text-[11px] text-silver/60">{sub}</div>
    </div>
  );
}
