import { NextResponse } from "next/server";
import irxSnapshot from "@/data/snapshot/IRX.json";
import spySnapshot from "@/data/snapshot/SPY.json";
import {
  assemble,
  fetchRatesLive,
  fetchTickerLive,
  isValidTicker,
  normalizeTicker,
  resolveSymbol,
  type RateSnapshot,
  type TickerSnapshot,
} from "@/lib/marketData";
import type { MarketData } from "@/lib/types";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const spyBackup = spySnapshot as TickerSnapshot;
const irxBackup = irxSnapshot as RateSnapshot;

/** Small in-memory cache so repeated plays in one server process don't re-hit Yahoo. */
const cache = new Map<string, { at: number; data: MarketData }>();
const TTL_MS = 60 * 60 * 1000;

export async function GET(req: Request) {
  const url = new URL(req.url);
  const raw = normalizeTicker(url.searchParams.get("ticker") || "SPY");
  if (!isValidTicker(raw)) {
    return NextResponse.json({ error: "That doesn't look like a ticker symbol or company name." }, { status: 400 });
  }
  const hit = cache.get(raw);
  if (hit && Date.now() - hit.at < TTL_MS) return NextResponse.json(hit.data);

  let ticker = raw;
  const first = await Promise.allSettled([fetchTickerLive(ticker), fetchRatesLive()]);
  let tickerRes = first[0];
  const ratesRes = first[1];
  // Not a symbol Yahoo knows (or a company name)? Ask Yahoo search and try the best match.
  if (tickerRes.status === "rejected") {
    const resolved = await resolveSymbol(raw);
    if (resolved && resolved !== raw) {
      ticker = resolved;
      const cached = cache.get(ticker);
      if (cached && Date.now() - cached.at < TTL_MS) return NextResponse.json(cached.data);
      [tickerRes] = await Promise.allSettled([fetchTickerLive(ticker)]);
    }
  }

  const rates = ratesRes.status === "fulfilled" ? ratesRes.value : irxBackup.rates;
  let data: MarketData;
  if (tickerRes.status === "fulfilled") {
    data = assemble(ticker, tickerRes.value, rates, "live", new Date().toISOString());
  } else if (ticker === "SPY") {
    data = assemble("SPY", spyBackup, rates, "snapshot", spyBackup.fetchedAt);
  } else {
    const reason = tickerRes.reason instanceof Error ? tickerRes.reason.message : String(tickerRes.reason);
    return NextResponse.json(
      { error: `Couldn't find prices for "${raw}" (${reason}). Try a ticker like AAPL or a company name like Apple; SPY always works.` },
      { status: 502 },
    );
  }
  cache.set(raw, { at: Date.now(), data });
  if (ticker !== raw) cache.set(ticker, { at: Date.now(), data });
  return NextResponse.json(data);
}
