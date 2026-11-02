import { describe, expect, it } from "vitest";
import { finalizeWeekly, normalizeQuotes, normalizeTicker } from "@/lib/marketData";

const daily = [
  { date: "2026-10-12", close: 1 },
  { date: "2026-10-13", close: 1 },
  { date: "2026-10-14", close: 1 },
  { date: "2026-10-15", close: 1 },
  { date: "2026-10-16", close: 1 },
  { date: "2026-10-19", close: 1 },
  { date: "2026-10-20", close: 1 },
  { date: "2026-10-21", close: 1 },
  { date: "2026-10-22", close: 1 }, // holiday-shortened week: no Friday
  { date: "2026-10-26", close: 1 },
  { date: "2026-10-27", close: 1 },
  { date: "2026-10-28", close: 1 },
  { date: "2026-10-29", close: 1 },
  { date: "2026-10-30", close: 1 },
  { date: "2026-11-02", close: 1 },
  { date: "2026-11-03", close: 1 },
  { date: "2026-11-04", close: 1 },
  { date: "2026-11-05", close: 1 },
  { date: "2026-11-06", close: 1 },
];
const weekly = [
  { date: "2026-10-12", close: 100 },
  { date: "2026-10-19", close: 101 },
  { date: "2026-10-26", close: 102 },
  { date: "2026-11-02", close: 103 }, // current, unfinished week
];

describe("weekly bar finalization", () => {
  it("labels each week by its last trading day and handles holiday-shortened weeks", () => {
    const out = finalizeWeekly(weekly, daily, new Date("2026-11-02T20:00:00Z"));
    expect(out.map((p) => p.date)).toEqual(["2026-10-16", "2026-10-22", "2026-10-30"]);
    expect(out.map((p) => p.close)).toEqual([100, 101, 102]);
  });
  it("drops the current week until its Friday has passed", () => {
    const sat = finalizeWeekly(weekly, daily, new Date("2026-11-07T12:00:00Z"));
    expect(sat.map((p) => p.date)).toContain("2026-11-06");
    const fri = finalizeWeekly(weekly, daily, new Date("2026-11-06T12:00:00Z"));
    expect(fri.map((p) => p.date)).not.toContain("2026-11-06");
  });
  it("keeps exactly the most recent five years", () => {
    const bars = [];
    const dailyLong = [];
    for (let w = 0; w < 300; w++) {
      const d = new Date(Date.UTC(2020, 0, 6) + w * 7 * 86_400_000);
      const mon = d.toISOString().slice(0, 10);
      const fri = new Date(d.getTime() + 4 * 86_400_000).toISOString().slice(0, 10);
      bars.push({ date: mon, close: 100 + w });
      dailyLong.push({ date: fri, close: 100 + w });
    }
    const out = finalizeWeekly(bars, dailyLong, new Date("2026-11-02T00:00:00Z"));
    const last = out[out.length - 1].date;
    const first = out[0].date;
    expect(last <= "2026-10-30").toBe(true);
    const years = (new Date(last).getTime() - new Date(first).getTime()) / (365.25 * 86_400_000);
    expect(years).toBeGreaterThan(4.95);
    expect(years).toBeLessThanOrEqual(5.0);
    expect(new Set(out.map((p) => p.date)).size).toBe(out.length); // no duplicate weeks
  });
});

describe("quote normalization", () => {
  it("prefers adjusted close, drops bad rows, dedupes dates and sorts", () => {
    const rows = [
      { date: new Date("2026-01-09"), close: 10, adjclose: 9.5 },
      { date: new Date("2026-01-02"), close: 8, adjclose: null },
      { date: new Date("2026-01-09"), close: 11, adjclose: 10.5 },
      { date: new Date("2026-01-16"), close: null },
    ];
    expect(normalizeQuotes(rows)).toEqual([
      { date: "2026-01-02", close: 8 },
      { date: "2026-01-09", close: 10.5 },
    ]);
  });
  it("normalizes typed tickers", () => {
    expect(normalizeTicker(" brk.b ")).toBe("BRK-B");
    expect(normalizeTicker("apple")).toBe("APPLE");
  });
});
