import { describe, expect, it } from "vitest";
import {
  buyOption,
  buyShares,
  computeBonus,
  newGame,
  nextWeek,
  portfolioValue,
  quoteOption,
  sellOption,
  sellShares,
  skipWeeks,
  spot,
} from "@/lib/engine";
import { computeStats } from "@/lib/metrics";
import { CONTRACT_SIZE, STARTING_CASH } from "@/lib/types";
import { syntheticMarket } from "./fixtures";

const data = syntheticMarket();

describe("trading rules", () => {
  it("starts with $100k cash, no positions, a welcome message", () => {
    const g = newGame(data);
    expect(g.cash).toBe(STARTING_CASH);
    expect(g.shares).toBe(0);
    expect(g.messages[0].kind).toBe("welcome");
    expect(g.history).toEqual([STARTING_CASH]);
    expect(g.bnhHistory).toEqual([STARTING_CASH]);
  });

  it("buys and sells shares without changing portfolio value, and never borrows", () => {
    let g = newGame(data);
    const p = spot(g);
    g = buyShares(g, 100);
    expect(g.cash).toBeCloseTo(STARTING_CASH - 100 * p, 6);
    expect(g.shares).toBe(100);
    expect(portfolioValue(g)).toBeCloseTo(STARTING_CASH, 6);
    expect(g.messages.some((m) => m.kind === "firstTrade")).toBe(true);
    expect(() => buyShares(g, 10_000)).toThrow(/Not enough cash/);
    expect(() => sellShares(g, 101)).toThrow(/short/);
    g = sellShares(g, 100);
    expect(g.cash).toBeCloseTo(STARTING_CASH, 6);
  });

  it("quotes an option with the right break-even and max loss", () => {
    const g = newGame(data);
    const q = quoteOption(g, { type: "call", expiryWeeks: 12, strikeMode: "up5", contracts: 2 });
    expect(q.strike).toBeCloseTo(spot(g) * 1.05, 1);
    expect(q.totalCost).toBeCloseTo(q.premiumPerShare * CONTRACT_SIZE * 2, 8);
    expect(q.breakEven).toBeCloseTo(q.strike + q.premiumPerShare, 8);
    expect(q.maxLoss).toBe(q.totalCost);
    const put = quoteOption(g, { type: "put", expiryWeeks: 4, strikeMode: "atm", contracts: 1 });
    expect(put.breakEven).toBeCloseTo(put.strike - put.premiumPerShare, 8);
  });

  it("buys an option, marks it weekly, and settles it in cash at expiry", () => {
    let g = newGame(data);
    g = buyOption(g, { type: "call", expiryWeeks: 4, strikeMode: "atm", contracts: 1 });
    expect(g.options).toHaveLength(1);
    expect(g.cash).toBeLessThan(STARTING_CASH);
    expect(portfolioValue(g)).toBeCloseTo(STARTING_CASH, 6);
    const strike = g.options[0].strike;
    for (let i = 0; i < 3; i++) g = nextWeek(g);
    expect(g.options).toHaveLength(1);
    const cashBefore = g.cash;
    g = nextWeek(g); // expiry week
    expect(g.options).toHaveLength(0);
    expect(g.pauseReason).toBe("expiry");
    const payoff = Math.max(0, spot(g) - strike) * CONTRACT_SIZE;
    expect(g.cash).toBeCloseTo(cashBefore + payoff, 6);
    expect(g.messages.at(-1)!.kind).toBe(payoff > 0 ? "optionPaid" : "optionExpired");
  });

  it("can sell an option early at its current value", () => {
    let g = newGame(data);
    g = buyOption(g, { type: "put", expiryWeeks: 12, strikeMode: "down5", contracts: 3 });
    g = nextWeek(g);
    const value = g.options[0].value;
    const cash = g.cash;
    g = sellOption(g, g.options[0].id);
    expect(g.options).toHaveLength(0);
    expect(g.cash).toBeCloseTo(cash + value, 6);
  });

  it("refuses an option that would expire after the game ends", () => {
    let g = newGame(data);
    while (g.status === "playing") g = nextWeek(g);
    expect(g.status).toBe("finished");
    let g2 = newGame(data);
    while (g2.week < data.prices.length - 6) g2 = nextWeek(g2);
    expect(() => buyOption(g2, { type: "call", expiryWeeks: 12, strikeMode: "atm", contracts: 1 })).toThrow(/after the game/);
  });

  it("computes year-end bonuses", () => {
    expect(computeBonus(0.2, true)).toBe(17_500);
    expect(computeBonus(-0.1, false)).toBe(2_500);
  });
});

describe("full game", () => {
  it("plays from week 1 to the end screen with cash never negative", () => {
    let g = newGame(data);
    g = buyShares(g, 300);
    g = buyOption(g, { type: "call", expiryWeeks: 12, strikeMode: "atm", contracts: 2 });
    let steps = 0;
    while (g.status === "playing") {
      if (g.week === 60) g = sellShares(g, 100);
      if (g.week === 120) g = buyOption(g, { type: "put", expiryWeeks: 4, strikeMode: "atm", contracts: 1 });
      if (g.week === 200) g = buyShares(g, 50);
      g = nextWeek(g);
      expect(g.cash).toBeGreaterThanOrEqual(0);
      expect(g.history).toHaveLength(g.week + 1);
      expect(g.bnhHistory).toHaveLength(g.week + 1);
      steps++;
    }
    expect(steps).toBe(data.prices.length - 1);
    expect(g.week).toBe(data.prices.length - 1);
    expect(g.options).toHaveLength(0);
    expect(g.bonuses).toHaveLength(5);
    expect(g.messages.at(-1)!.kind).toBe("finish");
    expect(g.history.at(-1)).toBeCloseTo(g.cash + g.shares * spot(g), 6);

    // Buy-and-hold: 100k of shares at week 0, held throughout.
    expect(g.bnhHistory.at(-1)).toBeCloseTo((STARTING_CASH / data.prices[0].close) * spot(g), 6);

    // Review metrics computed identically for both.
    const player = computeStats(g.history, g.rates);
    const bnh = computeStats(g.bnhHistory, g.rates);
    for (const s of [player, bnh]) {
      expect(Number.isFinite(s.sharpe)).toBe(true);
      expect(s.maxDrawdown).toBeGreaterThanOrEqual(0);
      expect(s.maxDrawdown).toBeLessThanOrEqual(1);
      expect(s.years).toBeCloseTo((data.prices.length - 1) / 52, 10);
    }
    expect(bnh.totalReturn).toBeCloseTo(spot(g) / data.prices[0].close - 1, 10);
  });

  it("auto-play pauses at option expiry and at year end", () => {
    let g = newGame(data);
    g = buyOption(g, { type: "call", expiryWeeks: 4, strikeMode: "atm", contracts: 1 });
    g = skipWeeks(g, 10);
    expect(g.week).toBe(4);
    expect(g.pauseReason).toBe("expiry");
    g = skipWeeks(g, 100);
    expect(g.week).toBe(52);
    expect(g.pauseReason).toBe("yearEnd");
    expect(g.bonuses).toHaveLength(1);
  });
});
