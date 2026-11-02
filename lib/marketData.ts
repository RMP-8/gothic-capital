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
  // One point per date (the last row wins), sorted ascending.
  const byDate = new Map<string, number>();
  for (const q of rows) {
    const v = useAdjusted ? (q.adjclose ?? q.close) : q.close;
    if (v == null || !Number.isFinite(v) || v <= 0) continue;
    byDate.set(iso(new Date(q.date)), Math.round(v * 10000) / 10000);
  }
  return [...byDate.entries()].sort((a, b) => (a[0] < b[0] ? -1 : 1)).map(([date, close]) => ({ date, close }));
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

function addDaysIso(isoDate: string, n: number): string {
  const d = new Date(isoDate + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/**
 * Yahoo dates each weekly bar by the Monday of its week, and the bar's close is the week's
 * last trading day. This relabels every bar with that actual last trading day (from the daily
 * series, so holiday-shortened weeks get Thursday etc.), drops the current week if it isn't
 * finished yet, and keeps exactly the most recent five years.
 */
export function finalizeWeekly(weekly: PricePoint[], daily: PricePoint[], today = new Date()): PricePoint[] {
  const todayIso = today.toISOString().slice(0, 10);
  const out: PricePoint[] = [];
  let d = 0;
  for (const bar of weekly) {
    const weekEnd = addDaysIso(bar.date, 6);
    let lastTradingDay: string | null = null;
    while (d < daily.length && daily[d].date <= weekEnd) {
      if (daily[d].date >= bar.date) lastTradingDay = daily[d].date;
      d++;
    }
    const date = lastTradingDay ?? addDaysIso(bar.date, 4);
    // The week is complete only once its Friday is in the past.
    if (addDaysIso(bar.date, 4) >= todayIso) continue;
    if (out.length && out[out.length - 1].date === date) out[out.length - 1] = { date, close: bar.close };
    else out.push({ date, close: bar.close });
  }
  if (out.length === 0) return out;
  const last = out[out.length - 1].date;
  const cutoff = new Date(last + "T00:00:00Z");
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - YEARS);
  const cutoffIso = cutoff.toISOString().slice(0, 10);
  return out.filter((p) => p.date > cutoffIso);
}

/** Live fetch of weekly + daily adjusted closes for a ticker. Throws on any failure. */
export async function fetchTickerLive(ticker: string): Promise<{ prices: PricePoint[]; daily: PricePoint[] }> {
  const start = periodStart();
  start.setUTCDate(start.getUTCDate() - 14); // a little extra so the trimmed window is a full five years
  // Daily needs ~6 extra weeks of history so the first week already has a 20-day vol window.
  const dailyStart = new Date(start);
  dailyStart.setUTCDate(dailyStart.getUTCDate() - 45);
  const [weekly, daily] = await Promise.all([chart(ticker, "1wk", start), chart(ticker, "1d", dailyStart)]);
  const dailyPts = normalizeQuotes(daily);
  const prices = finalizeWeekly(normalizeQuotes(weekly), dailyPts);
  if (prices.length < MIN_WEEKS) throw new Error(`${ticker} only has ${prices.length} weeks of price history; the game needs at least ${MIN_WEEKS}.`);
  return { prices, daily: dailyPts };
}

/** Fewer than five years is fine; the game just runs shorter. */
export const MIN_WEEKS = 26;

/** "brk.b" -> "BRK-B", " spy " -> "SPY" */
export function normalizeTicker(raw: string): string {
  return raw.trim().toUpperCase().replace(/\s+/g, " ").replace(/\.(?=[A-Z]$)/, "-");
}

/** Resolve a company name or loose symbol ("apple", "berkshire") to a Yahoo symbol via search. */
export async function resolveSymbol(query: string): Promise<string | null> {
  try {
    const res = await yf.search(query, { quotesCount: 6, newsCount: 0 }, { fetchOptions: { signal: AbortSignal.timeout(8_000) } });
    const quotes = (res.quotes ?? []) as Array<{ symbol?: string; quoteType?: string; isYahooFinance?: boolean }>;
    const hit = quotes.find((q) => q.symbol && (q.quoteType === "EQUITY" || q.quoteType === "ETF" || q.quoteType === "INDEX" || q.quoteType === "MUTUALFUND"));
    return hit?.symbol ?? null;
  } catch {
    return null;
  }
}

/** Live fetch of the 13-week T-bill yield (^IRX), weekly, in percent. */
export async function fetchRatesLive(): Promise<RatePoint[]> {
  const start = periodStart();
  start.setUTCDate(start.getUTCDate() - 14);
  const rows = await chart(RATE_SYMBOL, "1wk", start);
  // ^IRX weekly bars are Monday-dated like prices; label them by the week's Friday.
  const pts = normalizeQuotes(rows, false).map((p) => ({ date: addDaysIso(p.date, 4), rate: p.close }));
  if (pts.length < 52) throw new Error("Too few ^IRX bars");
  return pts;
}

export function isValidTicker(t: string): boolean {
  return /^[A-Z0-9 .^=&'-]{1,40}$/.test(t);
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
