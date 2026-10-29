import { describe, expect, it } from "vitest";
import { PRACTICE_STEPS, PRACTICE_WEEKS, practiceData } from "@/lib/practice";
import { nextTip } from "@/lib/tips";
import { buyOption, buyShares, newGame, nextWeek } from "@/lib/engine";
import { syntheticMarket } from "./fixtures";

const full = syntheticMarket();

describe("practice round", () => {
  it("uses a short slice of the real data and a fresh $100k", () => {
    const d = practiceData(full);
    expect(d.prices).toHaveLength(PRACTICE_WEEKS);
    expect(d.prices[0]).toEqual(full.prices[full.prices.length - PRACTICE_WEEKS]);
    expect(d.prices.at(-1)).toEqual(full.prices.at(-1));
    expect(d.daily).toBe(full.daily);
    const g = newGame(d);
    expect(g.cash).toBe(100_000);
    expect(g.data.prices).toHaveLength(PRACTICE_WEEKS);
  });

  it("can run the scripted steps inside the slice: 4-week options expire before the end", () => {
    let g = newGame(practiceData(full));
    g = buyShares(g, 20);
    g = nextWeek(g);
    g = buyOption(g, { type: "call", expiryWeeks: 4, strikeMode: "atm", contracts: 1 });
    g = buyOption(g, { type: "put", expiryWeeks: 4, strikeMode: "atm", contracts: 1 });
    for (let i = 0; i < 4; i++) g = nextWeek(g);
    expect(g.options).toHaveLength(0);
    expect(g.status).toBe("playing");
    expect(g.messages.filter((m) => m.kind === "optionPaid" || m.kind === "optionExpired")).toHaveLength(2);
  });

  it("keeps every coach message to at most two sentences", () => {
    const g = newGame(practiceData(full));
    for (const s of PRACTICE_STEPS) {
      const text = s.text({ g, before: g });
      const sentences = text.split(/[.!?](\s|$)/).filter((x) => x.trim().length > 1);
      expect(sentences.length, `${s.id}: ${text}`).toBeLessThanOrEqual(2);
      if (s.nudge) expect(s.nudge.split(/[.!?](\s|$)/).filter((x) => x.trim().length > 1).length).toBeLessThanOrEqual(2);
    }
  });
});

describe("help tips", () => {
  it("suggests a first trade when all cash, and warns about expiring options", () => {
    let g = newGame(full);
    expect(nextTip("playing", g)).toMatch(/all cash/i);
    g = buyOption(g, { type: "call", expiryWeeks: 4, strikeMode: "atm", contracts: 1 });
    for (let i = 0; i < 3; i++) g = nextWeek(g);
    expect(nextTip("playing", g)).toMatch(/expires next week/i);
    expect(nextTip("start", null)).toMatch(/ticker/i);
    expect(nextTip("practice", g)).toMatch(/Eleanor/);
  });
});
