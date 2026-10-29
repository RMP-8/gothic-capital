import { bsPrice, historicalVol, intrinsic } from "./blackScholes";
import { buildMessage, type MessageCtx } from "./messages";
import { promotionAt } from "./titles";
import {
  CONTRACT_SIZE,
  STARTING_CASH,
  WEEKS_PER_YEAR,
  type GameState,
  type MarketData,
  type Message,
  type MessageKind,
  type OptionOrder,
  type OptionPosition,
  type OptionQuote,
} from "./types";

/* ---------- helpers ---------- */

export function addDays(iso: string, n: number): string {
  const d = new Date(iso + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function daysBetween(fromIso: string, toIso: string): number {
  const a = new Date(fromIso + "T00:00:00Z").getTime();
  const b = new Date(toIso + "T00:00:00Z").getTime();
  return Math.round((b - a) / 86_400_000);
}

/** The date shown to the player for a real data date (shifted so week 1 is the day the app was opened). */
export function shownDate(s: { dateOffset: number }, iso: string): string {
  return s.dateOffset ? addDays(iso, s.dateOffset) : iso;
}

export function optionLabel(o: { type: string; strike: number; contracts: number }): string {
  const n = o.contracts === 1 ? "1 contract" : `${o.contracts} contracts`;
  return `${o.type} (${n}, $${o.strike.toFixed(2)} strike)`;
}

/** Per-week annualized vol (20 trading days) and T-bill rate, aligned to each weekly bar. */
export function precompute(data: MarketData): { vols: number[]; rates: number[] } {
  const vols: number[] = [];
  const rates: number[] = [];
  let dPtr = 0;
  let rPtr = -1;
  const dailyCloses: number[] = [];
  for (let i = 0; i < data.prices.length; i++) {
    const weekEnd = addDays(data.prices[i].date, 6);
    while (dPtr < data.daily.length && data.daily[dPtr].date <= weekEnd) {
      dailyCloses.push(data.daily[dPtr].close);
      dPtr++;
    }
    vols.push(historicalVol(dailyCloses, 20, 0.2));
    while (rPtr + 1 < data.rates.length && data.rates[rPtr + 1].date <= weekEnd) rPtr++;
    const r = rPtr >= 0 ? data.rates[rPtr].rate : (data.rates[0]?.rate ?? 0);
    rates.push(Number.isFinite(r) ? r : 0);
  }
  return { vols, rates };
}

export const spot = (s: GameState): number => s.data.prices[s.week].close;
export const weekDate = (s: GameState): string => s.data.prices[s.week].date;
export const totalWeeks = (s: GameState): number => s.data.prices.length;

export function optionsValue(s: GameState): number {
  return s.options.reduce((a, o) => a + o.value, 0);
}

export function portfolioValue(s: GameState): number {
  return s.cash + s.shares * spot(s) + optionsValue(s);
}

export function weekChange(s: GameState): number {
  if (s.week === 0) return 0;
  const prev = s.history[s.week - 1];
  return prev > 0 ? s.history[s.week] / prev - 1 : 0;
}

export function beatingBenchmark(s: GameState): boolean {
  return s.history[s.week] > s.bnhHistory[s.week];
}

function markOptionAt(s: GameState, o: OptionPosition, week: number): number {
  const price = s.data.prices[week].close;
  const weeksLeft = o.expiryWeek - week;
  if (weeksLeft <= 0) return intrinsic(o.type, price, o.strike) * CONTRACT_SIZE * o.contracts;
  const T = weeksLeft / WEEKS_PER_YEAR;
  return bsPrice(o.type, price, o.strike, T, s.rates[week] / 100, s.vols[week]) * CONTRACT_SIZE * o.contracts;
}

function withValue(s: GameState): GameState {
  const history = s.history.slice();
  history[s.week] = portfolioValue(s);
  return { ...s, history };
}

function push(s: GameState, kind: MessageKind, ctx: MessageCtx): GameState {
  const msg: Message = buildMessage(`m${s.nextId}`, kind, s.week, weekDate(s), { ...ctx, ticker: s.ticker });
  return { ...s, messages: [...s.messages, msg], nextId: s.nextId + 1 };
}

/* ---------- lifecycle ---------- */

export function newGame(data: MarketData, startDate?: string): GameState {
  if (data.prices.length < 2) throw new Error("Need at least two weeks of prices");
  const dateOffset = startDate ? daysBetween(data.prices[0].date, startDate) : 0;
  const { vols, rates } = precompute(data);
  const bnhShares = STARTING_CASH / data.prices[0].close;
  const base: GameState = {
    ticker: data.ticker,
    data,
    week: 0,
    cash: STARTING_CASH,
    shares: 0,
    avgCost: 0,
    options: [],
    history: [STARTING_CASH],
    bnhHistory: [STARTING_CASH],
    bnhShares,
    messages: [],
    title: "Junior PM",
    bonuses: [],
    tradeCount: 0,
    allTimeHigh: STARTING_CASH,
    lastAthWeek: 0,
    status: "playing",
    pauseReason: null,
    vols,
    rates,
    nextId: 1,
    dateOffset,
  };
  return push(base, "welcome", {});
}

/* ---------- trading ---------- */

function assertPlaying(s: GameState) {
  if (s.status !== "playing") throw new Error("The game is over");
}

function noteTrade(s: GameState): GameState {
  const next = { ...s, tradeCount: s.tradeCount + 1 };
  return s.tradeCount === 0 ? push(next, "firstTrade", {}) : next;
}

export function maxBuyableShares(s: GameState): number {
  return Math.floor(s.cash / spot(s));
}

export function buyShares(s: GameState, n: number): GameState {
  assertPlaying(s);
  if (!Number.isInteger(n) || n < 1) throw new Error("Enter a whole number of shares");
  const cost = n * spot(s);
  if (cost > s.cash + 1e-9) throw new Error("Not enough cash. No borrowing at Gothic Capital.");
  const totalCost = s.avgCost * s.shares + cost;
  const shares = s.shares + n;
  return withValue(noteTrade({ ...s, cash: s.cash - cost, shares, avgCost: totalCost / shares }));
}

export function sellShares(s: GameState, n: number): GameState {
  assertPlaying(s);
  if (!Number.isInteger(n) || n < 1) throw new Error("Enter a whole number of shares");
  if (n > s.shares) throw new Error("You can't sell shares you don't own. No short selling here.");
  const shares = s.shares - n;
  return withValue(
    noteTrade({ ...s, cash: s.cash + n * spot(s), shares, avgCost: shares === 0 ? 0 : s.avgCost }),
  );
}

export function strikeFor(price: number, mode: OptionOrder["strikeMode"]): number {
  const mult = mode === "up5" ? 1.05 : mode === "down5" ? 0.95 : 1;
  return Math.round(price * mult * 100) / 100;
}

export function quoteOption(s: GameState, order: OptionOrder): OptionQuote {
  const S = spot(s);
  const strike = strikeFor(S, order.strikeMode);
  const T = order.expiryWeeks / WEEKS_PER_YEAR;
  const rate = s.rates[s.week] / 100;
  const sigma = s.vols[s.week];
  const premiumPerShare = bsPrice(order.type, S, strike, T, rate, sigma);
  const contracts = Math.max(1, Math.floor(order.contracts));
  const totalCost = premiumPerShare * CONTRACT_SIZE * contracts;
  return {
    type: order.type,
    strike,
    expiryWeeks: order.expiryWeeks,
    contracts,
    premiumPerShare,
    totalCost,
    breakEven: order.type === "call" ? strike + premiumPerShare : strike - premiumPerShare,
    maxLoss: totalCost,
    sigma,
    rate: s.rates[s.week],
    spot: S,
  };
}

export function buyOption(s: GameState, order: OptionOrder): GameState {
  assertPlaying(s);
  if (!Number.isInteger(order.contracts) || order.contracts < 1) {
    throw new Error("Enter a whole number of contracts");
  }
  if (order.expiryWeeks !== 4 && order.expiryWeeks !== 12) throw new Error("Pick a 4 or 12 week expiry");
  if (s.week + order.expiryWeeks > totalWeeks(s) - 1) {
    throw new Error("That option would expire after the game ends. Pick a shorter expiry.");
  }
  const q = quoteOption(s, order);
  if (q.totalCost > s.cash + 1e-9) throw new Error("Not enough cash for that premium.");
  const pos: OptionPosition = {
    id: `o${s.nextId}`,
    type: order.type,
    strike: q.strike,
    contracts: order.contracts,
    openedWeek: s.week,
    expiryWeek: s.week + order.expiryWeeks,
    premiumPaid: q.totalCost,
    value: q.totalCost,
  };
  return withValue(
    noteTrade({ ...s, cash: s.cash - q.totalCost, options: [...s.options, pos], nextId: s.nextId + 1 }),
  );
}

export function sellOption(s: GameState, id: string): GameState {
  assertPlaying(s);
  const pos = s.options.find((o) => o.id === id);
  if (!pos) throw new Error("Option not found");
  return withValue(
    noteTrade({ ...s, cash: s.cash + pos.value, options: s.options.filter((o) => o.id !== id) }),
  );
}

/* ---------- time ---------- */

export function computeBonus(yearReturn: number, beatBenchmark: boolean): number {
  const raw = 2_500 + Math.max(0, yearReturn) * 50_000 + (beatBenchmark ? 5_000 : 0);
  return Math.round(raw / 100) * 100;
}

export function nextWeek(input: GameState): GameState {
  if (input.status !== "playing") return input;
  const w = input.week + 1;
  const last = totalWeeks(input) - 1;
  let s: GameState = { ...input, week: w, pauseReason: null };
  const price = spot(s);

  // Settle expiring options, re-mark the rest.
  let cash = s.cash;
  const kept: OptionPosition[] = [];
  const settled: { pos: OptionPosition; payoff: number }[] = [];
  for (const o of s.options) {
    if (o.expiryWeek <= w) {
      const payoff = intrinsic(o.type, price, o.strike) * CONTRACT_SIZE * o.contracts;
      cash += payoff;
      settled.push({ pos: o, payoff });
    } else {
      kept.push({ ...o, value: markOptionAt(s, o, w) });
    }
  }
  s = { ...s, cash, options: kept };
  for (const { pos, payoff } of settled) {
    s = push(s, payoff > 0 ? "optionPaid" : "optionExpired", { optionLabel: optionLabel(pos), amount: payoff });
    s = { ...s, pauseReason: "expiry" };
  }

  // Record values.
  const value = portfolioValue(s);
  const bnh = s.bnhShares * price;
  s = { ...s, history: [...s.history, value], bnhHistory: [...s.bnhHistory, bnh] };

  // Weekly swing messages.
  const prev = s.history[w - 1];
  const change = prev > 0 ? value / prev - 1 : 0;
  if (change >= 0.03) s = push(s, "bigGain", { pct: change });
  else if (change <= -0.03) s = push(s, "bigLoss", { pct: change });

  // All-time high.
  if (value > s.allTimeHigh) {
    s = { ...s, allTimeHigh: value };
    if (value > STARTING_CASH * 1.02 && w - s.lastAthWeek >= 8) {
      s = push({ ...s, lastAthWeek: w }, "allTimeHigh", { amount: value });
    }
  }

  // Year end: bonus and possible promotion.
  if (w % WEEKS_PER_YEAR === 0) {
    const year = w / WEEKS_PER_YEAR;
    const yearStart = s.history[w - WEEKS_PER_YEAR];
    const yearReturn = yearStart > 0 ? value / yearStart - 1 : 0;
    const beat = value > bnh;
    const amount = computeBonus(yearReturn, beat);
    s = {
      ...s,
      bonuses: [...s.bonuses, { year, amount, yearReturn, beatBenchmark: beat }],
      pauseReason: "yearEnd",
    };
    s = push(s, "yearEnd", { year, pct: yearReturn, amount });
    const promo = promotionAt(w, s.title, beat);
    if (promo) s = push({ ...s, title: promo }, "promotion", { title: promo });
  }

  // Game over: close any open options at their market value.
  if (w >= last) {
    const closeValue = optionsValue(s);
    s = { ...s, cash: s.cash + closeValue, options: [], status: "finished", pauseReason: null };
    s = push(s, "finish", {});
  }
  return s;
}

/** Advance up to n weeks, stopping early when auto-play should pause or the game ends. */
export function skipWeeks(s: GameState, n: number): GameState {
  let cur = s;
  for (let i = 0; i < n; i++) {
    cur = nextWeek(cur);
    if (cur.status === "finished" || cur.pauseReason) break;
  }
  return cur;
}

export function clearPause(s: GameState): GameState {
  return s.pauseReason ? { ...s, pauseReason: null } : s;
}
