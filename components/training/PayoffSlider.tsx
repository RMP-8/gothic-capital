"use client";

import { useState } from "react";

export type Highlight = "strike" | "premium" | "breakeven" | "expiry" | null;

const W = 230;
const H = 150;
const PAD = { l: 34, r: 10, t: 12, b: 24 };
const LO = 70;
const HI = 130;

/** Interactive payoff chart: drag the slider to move the stock price and watch the option's profit or loss. */
export default function PayoffSlider({
  type,
  strike = 100,
  premium = 5,
  highlight = null,
}: {
  type: "call" | "put";
  strike?: number;
  premium?: number;
  highlight?: Highlight;
}) {
  const [price, setPrice] = useState(100);
  const pnl = (S: number) => (type === "call" ? Math.max(0, S - strike) : Math.max(0, strike - S)) - premium;
  const breakEven = type === "call" ? strike + premium : strike - premium;
  const yMin = -premium - 4;
  const yMax = Math.max(pnl(LO), pnl(HI)) + 4;
  const sx = (S: number) => PAD.l + ((S - LO) / (HI - LO)) * (W - PAD.l - PAD.r);
  const sy = (y: number) => PAD.t + (1 - (y - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);
  const pts: string[] = [];
  for (let S = LO; S <= HI; S += 2) pts.push(`${sx(S).toFixed(1)},${sy(pnl(S)).toFixed(1)}`);
  const cur = pnl(price);
  const hl = (k: Highlight) => (highlight === k ? "#ffffff" : "#8b98ab");

  return (
    <div className="flex flex-col items-center">
      <svg width={W} height={H} className="block">
        {/* max-loss floor */}
        <line x1={PAD.l} x2={W - PAD.r} y1={sy(-premium)} y2={sy(-premium)} stroke={highlight === "premium" ? "#d1605e" : "rgba(209,96,94,0.5)"} strokeDasharray="3 3" />
        <text x={W - PAD.r} y={sy(-premium) - 3} textAnchor="end" fontSize={9} fill={highlight === "premium" ? "#ffffff" : "#d1605e"}>
          max loss −${premium}
        </text>
        {/* zero line */}
        <line x1={PAD.l} x2={W - PAD.r} y1={sy(0)} y2={sy(0)} stroke="rgba(255,255,255,0.25)" />
        <text x={PAD.l - 4} y={sy(0) + 3} textAnchor="end" fontSize={9} fill="#8b98ab">
          $0
        </text>
        {/* strike */}
        <line x1={sx(strike)} x2={sx(strike)} y1={PAD.t} y2={H - PAD.b} stroke={highlight === "strike" ? "#ffffff" : "rgba(201,209,219,0.3)"} strokeDasharray="2 3" />
        <text x={sx(strike)} y={H - 10} textAnchor="middle" fontSize={9} fill={hl("strike")}>
          strike ${strike}
        </text>
        {/* payoff */}
        <polyline points={pts.join(" ")} fill="none" stroke="#1b6fc2" strokeWidth={2.2} />
        {/* break-even */}
        <circle cx={sx(breakEven)} cy={sy(0)} r={highlight === "breakeven" ? 5 : 3.5} fill="#ffffff" />
        <text x={sx(breakEven)} y={sy(0) - 8} textAnchor="middle" fontSize={9} fill={hl("breakeven")}>
          break-even ${breakEven}
        </text>
        {/* current price marker */}
        <line x1={sx(price)} x2={sx(price)} y1={PAD.t} y2={H - PAD.b} stroke="rgba(76,174,124,0.45)" />
        <circle cx={sx(price)} cy={sy(cur)} r={5} fill={cur >= 0 ? "#4cae7c" : "#d1605e"} stroke="#ffffff" strokeWidth={1.5} />
      </svg>
      <input
        type="range"
        min={LO}
        max={HI}
        step={1}
        value={price}
        onChange={(e) => setPrice(Number(e.target.value))}
        aria-label="Stock price at expiration"
        className="mt-1 w-[200px] accent-[#00539b]"
      />
      <div className="tabular mt-0.5 text-[11px] text-silver">
        Stock at <span className="text-white">${price}</span> → {type} {cur >= 0 ? "profit" : "loss"}{" "}
        <span className={cur >= 0 ? "text-gain" : "text-loss"}>
          {cur >= 0 ? "+" : "−"}${Math.abs(cur)}
        </span>{" "}
        per share
      </div>
    </div>
  );
}
