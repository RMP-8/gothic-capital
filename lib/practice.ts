import type { GameState, MarketData, OptionPosition } from "./types";
import { intrinsic } from "./blackScholes";
import { spot } from "./engine";
import { money, num, pct } from "./format";

/** Things the player can do that the practice coach cares about. */
export type ActionKind = "buyShares" | "sellShares" | "nextWeek" | "skip" | "buyCall" | "buyPut" | "sellOption" | "preview" | "autoplay";

/** Areas of the desk the coach can spotlight. */
export type Spot = "chart" | "ticket" | "inbox" | "strip" | "next" | "skip" | null;

export interface StepCtx {
  g: GameState;
  /** State just before the last player action (for "here's what happened" steps). */
  before: GameState | null;
}

export interface PracticeStep {
  id: string;
  spot: Spot;
  /** The action that completes this step. Steps without one just show a Continue button. */
  action?: ActionKind;
  /** Other actions that are fine during this step (e.g. opening a preview). */
  also?: ActionKind[];
  text: (c: StepCtx) => string;
  /** Shown when the player does something else. */
  nudge?: string;
  button?: string;
}

export const PRACTICE_WEEKS = 9;
export const PRACTICE_SHARES = 20;
export const PRACTICE_SELL = 10;

/** A short stretch of the real data for the practice round, starting about two years in. */
export function practiceData(full: MarketData): MarketData {
  const start = Math.max(0, Math.min(full.prices.length - PRACTICE_WEEKS, 100));
  return { ...full, prices: full.prices.slice(start, start + PRACTICE_WEEKS) };
}

function describeExpiry(o: OptionPosition, price: number): string {
  const payoff = intrinsic(o.type, price, o.strike) * 100 * o.contracts;
  const side = o.type === "call" ? "above" : "below";
  const wrongSide = o.type === "call" ? "below" : "above";
  if (payoff > 0) {
    return `Your ${o.type} (strike $${num(o.strike)}) paid ${money(payoff)} because the price finished ${side} the strike.`;
  }
  return `Your ${o.type} (strike $${num(o.strike)}) expired worthless because the price finished ${wrongSide} the strike.`;
}

export const PRACTICE_STEPS: PracticeStep[] = [
  {
    id: "welcome",
    spot: null,
    text: () => "This is a practice round with play money, so nothing here counts. The goal of the real game is simple: grow the fund and beat buy-and-hold.",
  },
  {
    id: "see-chart",
    spot: "chart",
    text: (c) => `The middle monitor shows ${c.g.ticker}'s price on the left and your portfolio against buy-and-hold on the right. The gray line is the benchmark you want to beat.`,
  },
  {
    id: "see-ticket",
    spot: "ticket",
    text: () => "The right monitor is your order ticket: buy or sell shares, or buy a call or put. Your open positions show on its right side.",
  },
  {
    id: "see-inbox",
    spot: "inbox",
    text: () => "The left monitor is your inbox. I'll send notes when something notable happens, and so will our investors.",
  },
  {
    id: "see-strip",
    spot: "strip",
    text: () => "The strip along the desk shows the date, the week, your cash, your total portfolio value and this week's change. Keep an eye on it.",
  },
  {
    id: "buy-shares",
    spot: "ticket",
    action: "buyShares",
    text: () => `Let's buy some shares. Type ${PRACTICE_SHARES} in the Shares box on the right monitor and press Buy.`,
    nudge: `Not yet. First buy ${PRACTICE_SHARES} shares: type ${PRACTICE_SHARES} in the Shares box and press Buy.`,
  },
  {
    id: "bought",
    spot: "ticket",
    text: (c) => {
      const n = c.g.shares;
      return `You now own ${n} share${n === 1 ? "" : "s"} of ${c.g.ticker} worth ${money(n * spot(c.g))}, paid for from your cash. From here on, their value moves with the price.`;
    },
  },
  {
    id: "next-week",
    spot: "next",
    action: "nextWeek",
    text: () => "Time only moves when you say so. Press Next week on the keyboard to see one week of real prices go by.",
    nudge: "Just press Next week for now. It's the blue key on the keyboard.",
  },
  {
    id: "moved",
    spot: "strip",
    text: (c) => {
      const b = c.before ?? c.g;
      const p0 = b.data.prices[b.week].close;
      const p1 = spot(c.g);
      const v = c.g.history[c.g.week];
      const ch = c.g.history[c.g.week - 1] > 0 ? v / c.g.history[c.g.week - 1] - 1 : 0;
      return `${c.g.ticker} went from $${num(p0)} to $${num(p1)}, so your portfolio is now ${money(v)} (${pct(ch)}). That's the whole game: what you hold follows the price.`;
    },
  },
  {
    id: "sell-shares",
    spot: "ticket",
    action: "sellShares",
    text: () => `Now sell ${PRACTICE_SELL} of your shares: type ${PRACTICE_SELL} in the Shares box and press Sell.`,
    nudge: `Let's sell first. Type ${PRACTICE_SELL} in the Shares box on the right monitor and press Sell.`,
  },
  {
    id: "sold",
    spot: "strip",
    text: (c) => `Sold at today's price, and that cash is back in your account: you have ${money(c.g.cash)} ready to use. You still hold ${c.g.shares} shares.`,
  },
  {
    id: "buy-call",
    spot: "ticket",
    action: "buyCall",
    also: ["preview"],
    text: () => "Now a call option. Click the Call tab, keep 4 weeks and At price, press Preview call & buy, read the preview, then confirm.",
    nudge: "Let's do the call first: Call tab, 4 weeks, At price, then Preview call & buy.",
  },
  {
    id: "call-explained",
    spot: "ticket",
    text: (c) => {
      const o = c.g.options.find((x) => x.type === "call");
      if (!o) return "You own a call. It makes money if the price rises above the strike plus the fee you paid.";
      const be = o.strike + o.premiumPaid / (100 * o.contracts);
      return `You paid ${money(o.premiumPaid)} for the right to buy 100 shares at $${num(o.strike)}. It makes money if ${c.g.ticker} ends above $${num(be)}, and the most you can lose is that fee.`;
    },
  },
  {
    id: "buy-put",
    spot: "ticket",
    action: "buyPut",
    also: ["preview"],
    text: () => "Same again with a put: click the Put tab, keep 4 weeks and At price, preview it and confirm.",
    nudge: "Let's do the put now: Put tab, 4 weeks, At price, then Preview put & buy.",
  },
  {
    id: "put-explained",
    spot: "ticket",
    text: (c) => {
      const o = c.g.options.find((x) => x.type === "put");
      if (!o) return "A put is a bet that the price falls. It also works as insurance on shares you own.";
      const be = o.strike - o.premiumPaid / (100 * o.contracts);
      return `A put is the opposite bet: it pays if ${c.g.ticker} ends below $${num(be)}. It also works as insurance for shares you own when the market drops.`;
    },
  },
  {
    id: "skip",
    spot: "skip",
    action: "skip",
    text: () => "Both options expire in 4 weeks. Press Skip 4 weeks to jump ahead and see how they settle.",
    nudge: "Use Skip 4 weeks for this one, so both options reach their expiry.",
  },
  {
    id: "expired",
    spot: "inbox",
    text: (c) => {
      const b = c.before;
      if (!b || b.options.length === 0) return "Both options expired and settled in cash automatically. Check your inbox for the details.";
      const price = spot(c.g);
      return b.options.map((o) => describeExpiry(o, price)).join(" ");
    },
  },
  {
    id: "scoreboard",
    spot: "chart",
    text: () => "At the end of the real game I score you on three things, against buy-and-hold. Here is your practice scoreboard.",
  },
  {
    id: "wrap",
    spot: null,
    text: () => "You're ready. Let's do this for real: five years, $100,000, same desk.",
    button: "Start the real game",
  },
];

export const PRACTICE_TOTAL = PRACTICE_STEPS.length;
