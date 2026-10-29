export interface PricePoint {
  /** ISO date, YYYY-MM-DD */
  date: string;
  /** Adjusted close (dividends and splits accounted for) */
  close: number;
}

export interface RatePoint {
  date: string;
  /** 13-week T-bill yield, annualized, in percent (e.g. 4.25) */
  rate: number;
}

export interface MarketData {
  ticker: string;
  /** Weekly adjusted closes, oldest first. One entry per game week. */
  prices: PricePoint[];
  /** Daily adjusted closes, used only for 20-day historical volatility. */
  daily: PricePoint[];
  /** Weekly ^IRX closes. */
  rates: RatePoint[];
  source: "live" | "snapshot";
  fetchedAt: string;
}

export type OptionType = "call" | "put";
export type ExpiryWeeks = 4 | 12;
export type StrikeMode = "atm" | "up5" | "down5";

export interface OptionOrder {
  type: OptionType;
  expiryWeeks: ExpiryWeeks;
  strikeMode: StrikeMode;
  contracts: number;
}

export interface OptionQuote {
  type: OptionType;
  strike: number;
  expiryWeeks: ExpiryWeeks;
  contracts: number;
  /** Black-Scholes premium per share */
  premiumPerShare: number;
  /** Total cost = premiumPerShare * 100 * contracts */
  totalCost: number;
  breakEven: number;
  maxLoss: number;
  sigma: number;
  rate: number;
  spot: number;
}

export interface OptionPosition {
  id: string;
  type: OptionType;
  strike: number;
  contracts: number;
  openedWeek: number;
  expiryWeek: number;
  premiumPaid: number;
  /** Current mark-to-market value (total, all contracts) */
  value: number;
}

export type MessageKind =
  | "welcome"
  | "firstTrade"
  | "bigGain"
  | "bigLoss"
  | "allTimeHigh"
  | "optionExpired"
  | "optionPaid"
  | "yearEnd"
  | "promotion"
  | "finish";

export interface Message {
  id: string;
  week: number;
  date: string;
  from: "founder" | "investors";
  kind: MessageKind;
  text: string;
}

export interface Bonus {
  year: number;
  amount: number;
  yearReturn: number;
  beatBenchmark: boolean;
}

export type JobTitle = "Junior PM" | "Portfolio Manager" | "Senior PM";

export type PauseReason = "expiry" | "yearEnd" | null;

export interface GameState {
  ticker: string;
  data: MarketData;
  /** Index into data.prices. Week number shown to the player is week + 1. */
  week: number;
  cash: number;
  shares: number;
  /** Average cost per share of the current share position */
  avgCost: number;
  options: OptionPosition[];
  /** Portfolio value at each week index 0..week */
  history: number[];
  /** Buy-and-hold value at each week index 0..week */
  bnhHistory: number[];
  bnhShares: number;
  messages: Message[];
  title: JobTitle;
  bonuses: Bonus[];
  tradeCount: number;
  allTimeHigh: number;
  lastAthWeek: number;
  status: "playing" | "finished";
  /** Set by nextWeek when auto-play should pause. Cleared by the UI. */
  pauseReason: PauseReason;
  /** Precomputed per-week annualized volatility and risk-free rate */
  vols: number[];
  rates: number[];
  nextId: number;
  /** Days added to every real data date for display, so the game calendar starts on the day the player opened the app. */
  dateOffset: number;
}

export const STARTING_CASH = 100_000;
export const CONTRACT_SIZE = 100;
export const WEEKS_PER_YEAR = 52;
