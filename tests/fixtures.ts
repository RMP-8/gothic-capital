import type { MarketData } from "@/lib/types";
import { addDays } from "@/lib/engine";

/** Deterministic 5-year synthetic market: trend plus a slow wave, no randomness. */
export function syntheticMarket(weeks = 261, ticker = "TEST"): MarketData {
  const start = "2021-10-04"; // a Monday
  const daily: MarketData["daily"] = [];
  const prices: MarketData["prices"] = [];
  const rates: MarketData["rates"] = [];
  const priceAt = (day: number) => 100 * Math.exp(0.0004 * day) * (1 + 0.08 * Math.sin(day / 40));
  for (let d = -40; d < weeks * 7; d++) {
    const date = addDays(start, d);
    const dow = new Date(date + "T00:00:00Z").getUTCDay();
    if (dow === 0 || dow === 6) continue; // skip weekends
    daily.push({ date, close: Number(priceAt(d).toFixed(2)) });
  }
  for (let w = 0; w < weeks; w++) {
    const monday = addDays(start, w * 7);
    const friday = addDays(monday, 4);
    const close = daily.filter((p) => p.date <= friday).at(-1)!.close;
    prices.push({ date: monday, close });
    rates.push({ date: monday, rate: 4 + Math.sin(w / 30) });
  }
  return { ticker, prices, daily, rates, source: "snapshot", fetchedAt: "2026-01-01T00:00:00Z" };
}
