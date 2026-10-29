import { NextResponse } from "next/server";
import irxSnapshot from "@/data/snapshot/IRX.json";
import spySnapshot from "@/data/snapshot/SPY.json";
import {
  assemble,
  fetchRatesLive,
  fetchTickerLive,
  isValidTicker,
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
  const ticker = (url.searchParams.get("ticker") || "SPY").trim().toUpperCase();
  if (!isValidTicker(ticker)) {
    return NextResponse.json({ error: "That doesn't look like a ticker symbol." }, { status: 400 });
  }
  const hit = cache.get(ticker);
  if (hit && Date.now() - hit.at < TTL_MS) return NextResponse.json(hit.data);

  const [tickerRes, ratesRes] = await Promise.allSettled([fetchTickerLive(ticker), fetchRatesLive()]);

  const rates = ratesRes.status === "fulfilled" ? ratesRes.value : irxBackup.rates;
  let data: MarketData;
  if (tickerRes.status === "fulfilled") {
    data = assemble(ticker, tickerRes.value, rates, "live", new Date().toISOString());
  } else if (ticker === "SPY") {
    data = assemble("SPY", spyBackup, rates, "snapshot", spyBackup.fetchedAt);
  } else {
    const reason = tickerRes.reason instanceof Error ? tickerRes.reason.message : String(tickerRes.reason);
    return NextResponse.json(
      { error: `Couldn't load ${ticker} right now (${reason}). Try SPY, which always works.` },
      { status: 502 },
    );
  }
  cache.set(ticker, { at: Date.now(), data });
  return NextResponse.json(data);
}
