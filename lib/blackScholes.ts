import type { OptionType } from "./types";

/** Standard normal cumulative distribution (Abramowitz & Stegun 26.2.17, |err| < 7.5e-8). */
export function normCdf(x: number): number {
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  const t = 1 / (1 + 0.2316419 * ax);
  const poly =
    t *
    (0.31938153 +
      t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  const pdf = Math.exp(-0.5 * ax * ax) / Math.sqrt(2 * Math.PI);
  const cdf = 1 - pdf * poly;
  return sign === 1 ? cdf : 1 - cdf;
}

/**
 * Black-Scholes price of a European option on a non-dividend-paying asset.
 * S spot, K strike, T years to expiry, r continuously-compounded annual rate, sigma annual vol.
 */
export function bsPrice(
  type: OptionType,
  S: number,
  K: number,
  T: number,
  r: number,
  sigma: number,
): number {
  if (T <= 0) return intrinsic(type, S, K);
  if (sigma <= 0) {
    const disc = K * Math.exp(-r * T);
    return type === "call" ? Math.max(0, S - disc) : Math.max(0, disc - S);
  }
  const sqrtT = Math.sqrt(T);
  const d1 = (Math.log(S / K) + (r + 0.5 * sigma * sigma) * T) / (sigma * sqrtT);
  const d2 = d1 - sigma * sqrtT;
  if (type === "call") {
    return S * normCdf(d1) - K * Math.exp(-r * T) * normCdf(d2);
  }
  return K * Math.exp(-r * T) * normCdf(-d2) - S * normCdf(-d1);
}

export function intrinsic(type: OptionType, S: number, K: number): number {
  return type === "call" ? Math.max(0, S - K) : Math.max(0, K - S);
}

/**
 * Annualized historical volatility from the last `window` daily log returns
 * (needs window + 1 closes). Returns `fallback` when there is not enough data.
 */
export function historicalVol(
  closes: number[],
  window = 20,
  fallback = 0.2,
): number {
  if (closes.length < window + 1) return fallback;
  const slice = closes.slice(-(window + 1));
  const rets: number[] = [];
  for (let i = 1; i < slice.length; i++) {
    if (slice[i - 1] > 0 && slice[i] > 0) rets.push(Math.log(slice[i] / slice[i - 1]));
  }
  if (rets.length < 2) return fallback;
  const mean = rets.reduce((a, b) => a + b, 0) / rets.length;
  const variance =
    rets.reduce((a, b) => a + (b - mean) * (b - mean), 0) / (rets.length - 1);
  const daily = Math.sqrt(variance);
  const annual = daily * Math.sqrt(252);
  return annual > 0 ? annual : fallback;
}
