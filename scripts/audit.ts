/**
 * Data audit: compare Yahoo Finance weekly prices (what the game uses) with Stooq's
 * independent weekly CSV for a few tickers at dates spread across the five years.
 * Stooq's CSV sits behind a browser check, so from a script the Stooq columns usually read n/a;
 * read the same dates on stooq.com/q/d/?s=spy.us in a browser and compare by hand.
 * Run with: npm run audit-data
 */
import YahooFinance from "yahoo-finance2";

const yf = new YahooFinance({ suppressNotices: ["yahooSurvey", "ripHistorical"] });
const TICKERS = ["SPY", "AAPL", "MSFT"];

type Row = { date: string; close: number; adj: number };

async function yahooWeekly(sym: string): Promise<Row[]> {
  const period1 = new Date();
  period1.setUTCFullYear(period1.getUTCFullYear() - 5);
  const res = await yf.chart(sym, { period1, period2: new Date(), interval: "1wk" });
  return (res.quotes as Array<{ date: Date; close: number | null; adjclose?: number | null }>)
    .filter((q) => q.close != null)
    .map((q) => ({ date: new Date(q.date).toISOString().slice(0, 10), close: q.close as number, adj: (q.adjclose ?? q.close) as number }));
}

async function stooqWeekly(sym: string): Promise<Map<string, number>> {
  const url = `https://stooq.com/q/d/l/?s=${sym.toLowerCase()}.us&i=w`;
  const text = await (await fetch(url, { headers: { "User-Agent": "Mozilla/5.0" } })).text();
  const map = new Map<string, number>();
  for (const line of text.trim().split("\n").slice(1)) {
    const [date, , , , close] = line.split(",");
    if (date && close) map.set(date, Number(close));
  }
  return map;
}

function addDays(iso: string, n: number) {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

async function main() {
  for (const sym of TICKERS) {
    const y = await yahooWeekly(sym);
    const s = await stooqWeekly(sym);
    const picks = [0, Math.floor(y.length * 0.25), Math.floor(y.length * 0.5), Math.floor(y.length * 0.75), y.length - 2];
    console.log(`\n${sym}: Yahoo ${y.length} weekly bars ${y[0].date}..${y[y.length - 1].date}; Stooq ${s.size} rows`);
    console.log("week(Mon)   Yahoo close  Yahoo adj   Stooq close  diff(close)  stooq date");
    for (const i of picks) {
      const r = y[i];
      // Stooq dates weekly rows by the week's last trading day; look within the same Mon..Sun week
      let sd = "";
      let sc = NaN;
      for (let k = 0; k <= 6; k++) {
        const d = addDays(r.date, k);
        if (s.has(d)) {
          sd = d;
          sc = s.get(d)!;
        }
      }
      const diff = Number.isFinite(sc) ? ((r.close / sc - 1) * 100).toFixed(2) + "%" : "n/a";
      console.log(`${r.date}  ${r.close.toFixed(2).padStart(10)}  ${r.adj.toFixed(2).padStart(9)}  ${Number.isFinite(sc) ? sc.toFixed(2).padStart(10) : "       n/a"}  ${diff.padStart(9)}  ${sd}`);
    }
    const first = y[0];
    const last = y[y.length - 2];
    const stooqFirst = [...s.entries()].find(([d]) => d >= first.date);
    const stooqLast = [...s.entries()].filter(([d]) => d <= addDays(last.date, 6)).at(-1);
    console.log(
      `5y total return: Yahoo adjusted ${(((last.adj / first.adj) - 1) * 100).toFixed(1)}%, Yahoo raw close ${(((last.close / first.close) - 1) * 100).toFixed(1)}%, Stooq close ${stooqFirst && stooqLast ? (((stooqLast[1] / stooqFirst[1]) - 1) * 100).toFixed(1) + "%" : "n/a"}`,
    );
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
