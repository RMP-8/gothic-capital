/**
 * Refresh the backup data snapshot used when the live Yahoo Finance fetch fails.
 * Run with: npm run snapshot
 */
import { mkdirSync, writeFileSync } from "node:fs";
import { fetchRatesLive, fetchTickerLive } from "../lib/marketData";

async function main() {
  const fetchedAt = new Date().toISOString();
  const spy = await fetchTickerLive("SPY");
  const rates = await fetchRatesLive();
  mkdirSync("data/snapshot", { recursive: true });
  writeFileSync("data/snapshot/SPY.json", JSON.stringify({ ticker: "SPY", fetchedAt, ...spy }, null, 1));
  writeFileSync("data/snapshot/IRX.json", JSON.stringify({ symbol: "^IRX", fetchedAt, rates }, null, 1));
  console.log(
    `SPY: ${spy.prices.length} weekly bars (${spy.prices[0].date} .. ${spy.prices.at(-1)!.date}), ${spy.daily.length} daily bars`,
  );
  console.log(`^IRX: ${rates.length} weekly bars, latest ${rates.at(-1)!.rate}%`);
}

main().catch((e) => {
  console.error("Snapshot failed:", e);
  process.exit(1);
});
