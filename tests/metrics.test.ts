import { describe, expect, it } from "vitest";
import { computeStats, irr, maxDrawdown, periodReturns, sharpeRatio, stdDev } from "@/lib/metrics";

describe("maxDrawdown", () => {
  it("finds the biggest peak-to-trough drop", () => {
    expect(maxDrawdown([100, 120, 90, 110, 80, 130])).toBeCloseTo((120 - 80) / 120, 10);
  });
  it("is zero for a rising series", () => {
    expect(maxDrawdown([1, 2, 3, 4])).toBe(0);
  });
});

describe("irr", () => {
  it("annualizes a single-deposit return", () => {
    expect(irr(100_000, 200_000, 5)).toBeCloseTo(Math.pow(2, 1 / 5) - 1, 10); // 14.87%
    expect(irr(100, 121, 2)).toBeCloseTo(0.1, 10);
    expect(irr(100, 50, 1)).toBeCloseTo(-0.5, 10);
  });
});

describe("sharpeRatio", () => {
  it("matches a hand computation with a constant T-bill rate", () => {
    const values = [100, 102, 101, 104, 103, 106];
    const rets = periodReturns(values);
    const rf = 5.2; // 5.2% annual -> 0.1% per week
    const excess = rets.map((r) => r - 0.052 / 52);
    const mean = excess.reduce((a, b) => a + b, 0) / excess.length;
    const expected = (mean / stdDev(excess)) * Math.sqrt(52);
    expect(sharpeRatio(values, Array(values.length).fill(rf))).toBeCloseTo(expected, 10);
  });
  it("is zero when returns never vary, even with a positive T-bill rate", () => {
    expect(sharpeRatio([100, 100, 100, 100], [0, 0, 0, 0])).toBe(0);
    expect(sharpeRatio([100, 100, 100, 100, 100], [4.1, 4.2, 4.3, 4.4, 4.5])).toBe(0);
  });
});

describe("computeStats", () => {
  it("uses the same method for any series (player and buy-and-hold alike)", () => {
    const series = [100, 110, 105, 120, 115];
    const rates = [4, 4, 4, 4, 4];
    const a = computeStats(series, rates);
    const b = computeStats(series.map((v) => v * 3), rates); // scale-invariant
    expect(a.sharpe).toBeCloseTo(b.sharpe, 10);
    expect(a.maxDrawdown).toBeCloseTo(b.maxDrawdown, 10);
    expect(a.irr).toBeCloseTo(b.irr, 10);
    expect(a.totalReturn).toBeCloseTo(0.15, 10);
    expect(a.years).toBeCloseTo(4 / 52, 10);
  });
});
