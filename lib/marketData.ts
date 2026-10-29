import YahooFinance from "yahoo-finance2";
import type { MarketData, PricePoint, RatePoint } from "./types";

/** Instantiate once per server process so the cookie/crumb handshake happens once. */
const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });

export const YEARS = 5;
export const RATE_SYMBOL = "^IRX";

export interface ChartRow {
  date: Date;
  close: number | null;
  adjclose?: number | null;
}

function iso(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/** Convert raw chart quotes to clean points: ISO date + adjusted close, sorted, de-duplicated. */
export function normalizeQuotes(rows: ChartRow[], useAdjusted = true): PricePoint[] {
  const out: PricePoint[] = [];
  for (const q of rows) {
    const v = useAdjusted ? (q.adjclose ?? q.close) : q.close;
    if (v == null || !Number.isFinite(v) || v <= 0) continue;
    const date = iso(new Date(q.date));
    const v4 = Math.round(v * 10000) / 10000;
    if (out.length && out[out.length - 1].date === date) out[out.length - 1] = { date, close: v4 };
    else out.push({ date, close: v4 });
  }
  return out.sort((a, b) => (a.date < b.date ? -1 : 1));
}

export function periodStart(now = new Date()): Date {
  const d = new Date(now);
  d.setUTCFullYear(d.getUTCFullYear() - YEARS);
  return d;
}

async function chart(symbol: string, interval: "1wk" | "1d", period1: Date): Promise<ChartRow[]> {
  const res = await yf.chart(
    symbol,
    { period1, period2: new Date(), interval },
    { fetchOptions: { signal: AbortSignal.timeout(12_000) } },
  );
  return (res.quotes ?? []) as ChartRow[];
}

/** Live fetch of weekly + daily adjusted closes for a ticker. Throws on any failure. */
export async function fetchTickerLive(ticker: string): Promise<{ prices: PricePoint[]; daily: PricePoint[] }> {
  const start = periodStart();
  // Daily needs ~6 extra weeks of history so the first week already has a 20-day vol window.
  const dailyStart = new Date(start);
  dailyStart.setUTCDate(dailyStart.getUTCDate() - 45);
  const [weekly, daily] = await Promise.all([chart(ticker, "1wk", start), chart(ticker, "1d", dailyStart)]);
  const prices = normalizeQuotes(weekly);
  if (prices.length < 52) throw new Error(`Only ${prices.length} weekly bars for ${ticker}`);
  return { prices, daily: normalizeQuotes(daily) };
}

/** Live fetch of the 13-week T-bill yield (^IRX), weekly, in percent. */
export async function fetchRatesLive(): Promise<RatePoint[]> {
  const start = periodStart();
  start.setUTCDate(start.getUTCDate() - 14);
  const rows = await chart(RATE_SYMBOL, "1wk", start);
  const pts = normalizeQuotes(rows, false).map((p) => ({ date: p.date, rate: p.close }));
  if (pts.length < 52) throw new Error("Too few ^IRX bars");
  return pts;
}

export function isValidTicker(t: string): boolean {
  return /^[A-Z0-9.^=-]{1,12}$/.test(t);
}

export type TickerSnapshot = { ticker: string; fetchedAt: string; prices: PricePoint[]; daily: PricePoint[] };
export type RateSnapshot = { symbol: string; fetchedAt: string; rates: RatePoint[] };

export function assemble(
  ticker: string,
  t: { prices: PricePoint[]; daily: PricePoint[] },
  rates: RatePoint[],
  source: MarketData["source"],
  fetchedAt: string,
): MarketData {
  return { ticker, prices: t.prices, daily: t.daily, rates, source, fetchedAt };
}
