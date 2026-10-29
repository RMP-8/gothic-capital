import { describe, expect, it } from "vitest";
import { bsPrice, historicalVol, normCdf } from "@/lib/blackScholes";

describe("normCdf", () => {
  it("matches tabulated values", () => {
    expect(normCdf(0)).toBeCloseTo(0.5, 6);
    expect(normCdf(1.96)).toBeCloseTo(0.975, 4);
    expect(normCdf(-1.96)).toBeCloseTo(0.025, 4);
    expect(normCdf(3)).toBeCloseTo(0.99865, 4);
  });
});

describe("Black-Scholes", () => {
  // Textbook example (Hull): S=100, K=100, T=1, r=5%, sigma=20%
  it("prices the textbook call and put", () => {
    expect(bsPrice("call", 100, 100, 1, 0.05, 0.2)).toBeCloseTo(10.4506, 3);
    expect(bsPrice("put", 100, 100, 1, 0.05, 0.2)).toBeCloseTo(5.5735, 3);
  });

  // Hull Example 15.6: S=42, K=40, r=10%, sigma=20%, T=0.5 -> call 4.76, put 0.81
  it("prices Hull example 15.6", () => {
    expect(bsPrice("call", 42, 40, 0.5, 0.1, 0.2)).toBeCloseTo(4.76, 2);
    expect(bsPrice("put", 42, 40, 0.5, 0.1, 0.2)).toBeCloseTo(0.81, 2);
  });

  it("satisfies put-call parity", () => {
    const S = 450, K = 460, T = 12 / 52, r = 0.045, sigma = 0.18;
    const c = bsPrice("call", S, K, T, r, sigma);
    const p = bsPrice("put", S, K, T, r, sigma);
    expect(c - p).toBeCloseTo(S - K * Math.exp(-r * T), 6);
  });

  it("returns intrinsic value at expiry", () => {
    expect(bsPrice("call", 110, 100, 0, 0.05, 0.2)).toBe(10);
    expect(bsPrice("put", 90, 100, 0, 0.05, 0.2)).toBe(10);
    expect(bsPrice("call", 90, 100, 0, 0.05, 0.2)).toBe(0);
  });
});

describe("historicalVol", () => {
  it("annualizes the sample std dev of 20 daily log returns", () => {
    // alternating +1% / -1% moves -> log returns of ±~0.00995
    const closes = [100];
    for (let i = 1; i <= 20; i++) closes.push(closes[i - 1] * (i % 2 ? 1.01 : 1 / 1.01));
    const rets = closes.slice(1).map((c, i) => Math.log(c / closes[i]));
    const m = rets.reduce((a, b) => a + b, 0) / rets.length;
    const sd = Math.sqrt(rets.reduce((a, b) => a + (b - m) ** 2, 0) / (rets.length - 1));
    expect(historicalVol(closes, 20)).toBeCloseTo(sd * Math.sqrt(252), 10);
  });
  it("falls back when there is too little data", () => {
    expect(historicalVol([100, 101, 102], 20, 0.25)).toBe(0.25);
  });
});
