import type { GameState } from "./types";

export interface Definition {
  term: string;
  text: string;
}

export const DEFINITIONS: Definition[] = [
  { term: "Shares", text: "A piece of the company or fund; their value rises and falls with the price." },
  { term: "Call option", text: "A fee for the right to buy at a set price later; it pays if the price rises above that price plus the fee." },
  { term: "Put option", text: "A fee for the right to sell at a set price later; it pays if the price falls below that price minus the fee." },
  { term: "Buy-and-hold", text: "Buying on day one and never trading; the benchmark you are trying to beat." },
  { term: "Sharpe ratio", text: "Return earned per unit of risk, after subtracting the T-bill rate; higher is better." },
  { term: "Max drawdown", text: "The biggest drop from a peak to a later low; smaller is better." },
  { term: "IRR", text: "The yearly return on the money you started with." },
];

export type Phase = "start" | "practice" | "playing" | "review";

/** One or two sentences about what to do right now. */
export function nextTip(phase: Phase, g: GameState | null): string {
  if (phase === "start" || !g) return "Pick a ticker (SPY is a good default) and take the job. You'll get the chance to do a practice round first.";
  if (phase === "practice") return "Follow Eleanor's card at the top of the screen. Each step highlights the exact thing to click.";
  if (phase === "review") return "Compare your three metrics with buy-and-hold, then play again or try another ticker.";
  if (g.status === "finished") return "Five years are done. Press Go to your review on the keyboard.";
  const soon = g.options.filter((o) => o.expiryWeek - g.week <= 1);
  if (soon.length) {
    const o = soon[0];
    return `Your ${o.type} expires next week. It settles in cash automatically: whatever it's worth at expiry goes to your account, or nothing if it's out of the money.`;
  }
  const near = g.options.filter((o) => o.expiryWeek - g.week <= 3);
  if (near.length) {
    const o = near[0];
    return `Your ${o.type} has ${o.expiryWeek - g.week} weeks left. You can sell it now at its current value from the positions list, or hold to expiry.`;
  }
  if (g.shares === 0 && g.options.length === 0) {
    return "You're all cash, which can't beat buy-and-hold. Buy some shares or an option on the right monitor, then press Next week.";
  }
  const lead = g.history[g.week] - g.bnhHistory[g.week];
  if (lead < 0) return "You're behind buy-and-hold. You can trade any time or press Next week; auto-play moves faster and pauses when an option expires.";
  return "You're ahead of buy-and-hold. Keep going with Next week or auto-play, and trade whenever you have a view.";
}
