import { WEEKS_PER_YEAR } from "./types";

/** Simple period returns: v[i] / v[i-1] - 1 */
export function periodReturns(values: number[]): number[] {
  const out: number[] = [];
  for (let i = 1; i < values.length; i++) {
    out.push(values[i - 1] === 0 ? 0 : values[i] / values[i - 1] - 1);
  }
  return out;
}

export function mean(xs: number[]): number {
  if (xs.length === 0) return 0;
  return xs.reduce((a, b) => a + b, 0) / xs.length;
}

/** Sample standard deviation (n - 1). */
export function stdDev(xs: number[]): number {
  if (xs.length < 2) return 0;
  const m = mean(xs);
  const v = xs.reduce((a, b) => a + (b - m) * (b - m), 0) / (xs.length - 1);
  return Math.sqrt(v);
}

/**
 * Annualized Sharpe ratio from a weekly value series.
 * Weekly excess return = weekly return - (annual T-bill % / 100) / 52, using the
 * T-bill rate in effect at the start of each week. Annualized by sqrt(52).
 */
export function sharpeRatio(values: number[], annualRatesPct: number[]): number {
  const rets = periodReturns(values);
  if (rets.length < 2) return 0;
  // A portfolio whose value never moves (e.g. all cash) has no risk, so the ratio is undefined; report 0.
  if (stdDev(rets) < 1e-12) return 0;
  const excess = rets.map((r, i) => {
    const rate = annualRatesPct[Math.min(i, annualRatesPct.length - 1)] ?? 0;
    return r - rate / 100 / WEEKS_PER_YEAR;
  });
  const sd = stdDev(excess);
  if (sd === 0) return 0;
  return (mean(excess) / sd) * Math.sqrt(WEEKS_PER_YEAR);
}

/** Largest peak-to-trough decline as a positive fraction (0.25 = -25%). */
export function maxDrawdown(values: number[]): number {
  let peak = -Infinity;
  let worst = 0;
  for (const v of values) {
    if (v > peak) peak = v;
    if (peak > 0) {
      const dd = (peak - v) / peak;
      if (dd > worst) worst = dd;
    }
  }
  return worst;
}

/**
 * Annualized return for a single deposit with no later cash flows:
 * (end / start) ^ (1 / years) - 1
 */
export function irr(startValue: number, endValue: number, years: number): number {
  if (startValue <= 0 || years <= 0) return 0;
  if (endValue <= 0) return -1;
  return Math.pow(endValue / startValue, 1 / years) - 1;
}

export interface PerformanceStats {
  totalReturn: number;
  sharpe: number;
  maxDrawdown: number;
  irr: number;
  endValue: number;
  years: number;
}

/** One function used for both the player and buy-and-hold, so both are measured identically. */
export function computeStats(values: number[], annualRatesPct: number[]): PerformanceStats {
  const start = values[0] ?? 0;
  const end = values[values.length - 1] ?? 0;
  const years = Math.max(1 / WEEKS_PER_YEAR, (values.length - 1) / WEEKS_PER_YEAR);
  return {
    totalReturn: start > 0 ? end / start - 1 : 0,
    sharpe: sharpeRatio(values, annualRatesPct),
    maxDrawdown: maxDrawdown(values),
    irr: irr(start, end, years),
    endValue: end,
    years,
  };
}
