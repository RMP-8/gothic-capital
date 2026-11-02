"use client";

import type { VisualKind } from "@/lib/lessons";
import PayoffSlider from "./PayoffSlider";

const W = 230;
const H = 170;
const BLUE = "#00539b";
const GRAY = "#9aa7ba";
const MUTED = "#6b7a93";

function Frame({ children, caption }: { children: React.ReactNode; caption?: string }) {
  return (
    <div className="flex flex-col items-center">
      <svg width={W} height={H} className="block">
        {children}
      </svg>
      {caption && <div className="mt-1 text-center text-[10.5px] text-ink-2">{caption}</div>}
    </div>
  );
}

/** Points along a path for a simple line chart in a 230x170 frame. */
function line(values: number[], color: string, width = 2, dashed = false, x0 = 20, x1 = 215, y0 = 20, y1 = 140) {
  const lo = Math.min(...values);
  const hi = Math.max(...values);
  const pts = values.map((v, i) => `${(x0 + ((x1 - x0) * i) / (values.length - 1)).toFixed(1)},${(y1 - ((v - lo) / (hi - lo || 1)) * (y1 - y0)).toFixed(1)}`);
  return <polyline points={pts.join(" ")} fill="none" stroke={color} strokeWidth={width} strokeDasharray={dashed ? "4 3" : undefined} strokeLinejoin="round" />;
}

export default function LessonVisual({ kind }: { kind: VisualKind }) {
  switch (kind) {
    case "stock": {
      // a company as a pie; your slice highlighted
      const cx = 115, cy = 80, r = 58;
      const a = (-90 * Math.PI) / 180;
      const b = ((-90 + 36) * Math.PI) / 180;
      const slice = `M${cx},${cy} L${(cx + r * Math.cos(a)).toFixed(1)},${(cy + r * Math.sin(a)).toFixed(1)} A${r},${r} 0 0 1 ${(cx + r * Math.cos(b)).toFixed(1)},${(cy + r * Math.sin(b)).toFixed(1)} Z`;
      return (
        <Frame caption="The company, cut into shares. Your shares are the blue slice.">
          <circle cx={cx} cy={cy} r={r} fill="rgba(11,30,77,0.06)" stroke={GRAY} strokeWidth={1.5} />
          {Array.from({ length: 10 }).map((_, i) => {
            const t = ((-90 + i * 36) * Math.PI) / 180;
            return <line key={i} x1={cx} y1={cy} x2={cx + r * Math.cos(t)} y2={cy + r * Math.sin(t)} stroke="rgba(11,30,77,0.2)" />;
          })}
          <path d={slice} fill={BLUE} />
          <text x={cx} y={cy + r + 22} textAnchor="middle" fontSize={11} fill="#0b1e4d">
            you
          </text>
        </Frame>
      );
    }
    case "spy":
      return (
        <Frame caption="One share of SPY = a sliver of 500 companies.">
          {Array.from({ length: 100 }).map((_, i) => {
            const x = 25 + (i % 20) * 9.5;
            const y = 24 + Math.floor(i / 20) * 12;
            return <rect key={i} x={x} y={y} width={7} height={8} rx={1.5} fill={i < 7 ? BLUE : "rgba(201,209,219,0.45)"} />;
          })}
          <rect x={22} y={20} width={194} height={64} rx={6} fill="none" stroke={GRAY} strokeWidth={1.5} />
          {line([100, 103, 101, 106, 110, 108, 113, 118], BLUE, 2, false, 25, 215, 96, 150)}
          <text x={120} y={162} textAnchor="middle" fontSize={10} fill={MUTED}>
            SPY follows the whole market
          </text>
        </Frame>
      );
    case "trade": {
      const vals = [100, 102, 99, 104, 108, 106, 110];
      return (
        <Frame caption="Buy at $100, sell at $110: +$10 per share.">
          {line(vals, GRAY, 2)}
          <circle cx={20} cy={140} r={5} fill="#4cae7c" />
          <text x={28} y={144} fontSize={10} fill="#0b1e4d">
            buy $100
          </text>
          <circle cx={215} cy={20} r={5} fill={BLUE} />
          <text x={208} y={14} textAnchor="end" fontSize={10} fill="#0b1e4d">
            sell $110
          </text>
          <text x={118} y={164} textAnchor="middle" fontSize={11} fill="#4cae7c">
            profit +$10 per share
          </text>
        </Frame>
      );
    }
    case "buyhold":
      return (
        <Frame caption="Gray: buy once and hold. Blue: trading in and out.">
          {line([100, 104, 103, 110, 115, 118, 126, 131, 140, 150, 161], GRAY, 2.5)}
          {line([100, 104, 101, 104, 109, 104, 112, 108, 118, 124, 135], BLUE, 2)}
          <text x={118} y={164} textAnchor="middle" fontSize={10} fill={MUTED}>
            5 years · one purchase vs. many trades
          </text>
        </Frame>
      );
    case "option":
      return <PayoffSlider type="call" />;
    case "call":
      return <PayoffSlider type="call" />;
    case "put":
      return <PayoffSlider type="put" />;
    case "strike":
      return <PayoffSlider type="call" highlight="strike" />;
    case "premium":
      return <PayoffSlider type="call" highlight="premium" />;
    case "breakeven":
      return <PayoffSlider type="call" highlight="breakeven" />;
    case "expiry":
      return (
        <Frame caption="A 4-week option: the clock runs out, then it settles.">
          <line x1={20} x2={215} y1={70} y2={70} stroke={GRAY} strokeWidth={2} />
          {[0, 1, 2, 3, 4].map((w) => (
            <g key={w}>
              <circle cx={20 + w * 48.75} cy={70} r={w === 4 ? 8 : 5} fill={w === 4 ? "#d1605e" : BLUE} />
              <text x={20 + w * 48.75} y={96} textAnchor="middle" fontSize={10} fill={MUTED}>
                {w === 0 ? "buy" : w === 4 ? "expires" : `wk ${w}`}
              </text>
            </g>
          ))}
          <text x={118} y={130} textAnchor="middle" fontSize={11} fill="#0b1e4d">
            stock $103 → call pays $3
          </text>
          <text x={118} y={148} textAnchor="middle" fontSize={11} fill={MUTED}>
            stock $97 → call pays $0
          </text>
        </Frame>
      );
    case "risk": {
      const rows = [
        { label: "Savings", lo: 4, hi: 4, color: GRAY },
        { label: "Stocks", lo: -20, hi: 30, color: BLUE },
        { label: "Options", lo: -100, hi: 100, color: "#d1605e" },
      ];
      const x = (v: number) => 120 + v * 0.45;
      return (
        <Frame caption="Wider bar = wider range of outcomes in a year.">
          <line x1={x(0)} x2={x(0)} y1={16} y2={140} stroke="rgba(11,30,77,0.25)" />
          {rows.map((r, i) => (
            <g key={r.label}>
              <text x={16} y={46 + i * 40} fontSize={10} fill="#0b1e4d">
                {r.label}
              </text>
              <rect x={x(Math.min(r.lo, 0))} y={34 + i * 40} width={Math.max(4, x(r.hi) - x(Math.min(r.lo, 0)))} height={16} rx={4} fill={r.color} fillOpacity={0.8} />
              <text x={x(r.hi) + 4} y={46 + i * 40} fontSize={9} fill={MUTED}>
                {r.lo === r.hi ? `+${r.hi}%` : `${r.lo}% … +${r.hi}%`}
              </text>
            </g>
          ))}
          <text x={x(0)} y={156} textAnchor="middle" fontSize={9} fill={MUTED}>
            0%
          </text>
        </Frame>
      );
    }
    case "sharpe":
      return (
        <Frame caption="Same +10%. Gray is steady (high Sharpe), blue is bumpy (low Sharpe).">
          {line([100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110], GRAY, 2.5)}
          {line([100, 106, 97, 108, 99, 111, 102, 113, 104, 112, 110], BLUE, 2)}
        </Frame>
      );
    case "drawdown": {
      const vals = [100, 108, 120, 112, 100, 90, 98, 110, 122, 130];
      return (
        <Frame caption="Peak $120k to low $90k: a 25% drawdown.">
          {line(vals, GRAY, 2.5)}
          <circle cx={20 + (195 * 2) / 9} cy={20 + (120 * (130 - 120)) / 40} r={5} fill="#4cae7c" />
          <circle cx={20 + (195 * 5) / 9} cy={20 + (120 * (130 - 90)) / 40} r={5} fill="#d1605e" />
          <line x1={20 + (195 * 2) / 9} x2={20 + (195 * 5) / 9} y1={20 + (120 * (130 - 120)) / 40} y2={20 + (120 * (130 - 90)) / 40} stroke="#d1605e" strokeDasharray="3 3" />
          <text x={118} y={164} textAnchor="middle" fontSize={11} fill="#d1605e">
            −25% from the peak
          </text>
        </Frame>
      );
    }
    case "irr": {
      const vals = [100, 110, 121, 133, 146, 161];
      return (
        <Frame caption="$100k growing 10% a year reaches $161k in 5 years.">
          {vals.map((v, i) => (
            <g key={i}>
              <rect x={22 + i * 33} y={140 - (v - 60) * 1.1} width={24} height={(v - 60) * 1.1} rx={3} fill={i === 0 ? GRAY : BLUE} />
              <text x={34 + i * 33} y={154} textAnchor="middle" fontSize={9} fill={MUTED}>
                yr {i}
              </text>
              <text x={34 + i * 33} y={134 - (v - 60) * 1.1} textAnchor="middle" fontSize={8.5} fill="#0b1e4d">
                {v}k
              </text>
            </g>
          ))}
        </Frame>
      );
    }
    default:
      return null;
  }
}
