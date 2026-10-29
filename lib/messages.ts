import type { Message, MessageKind } from "./types";

export const FOUNDER_NAME = "Eleanor Vance";

export type MessageCtx = {
  ticker?: string;
  pct?: number;
  amount?: number;
  year?: number;
  title?: string;
  optionLabel?: string;
};

const money = (n: number) =>
  n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
const pct = (p: number) => `${p >= 0 ? "+" : ""}${(p * 100).toFixed(1)}%`;

const TEMPLATES: Record<MessageKind, { from: Message["from"]; variants: ((c: MessageCtx) => string)[] }> = {
  welcome: {
    from: "founder",
    variants: [
      (c) =>
        `Welcome to Gothic Capital. There's $100,000 in your account and one ticker on your screen: ${c.ticker ?? "your ticker"}. Beat buying and holding it, and we'll talk about a bigger window.`,
    ],
  },
  firstTrade: {
    from: "founder",
    variants: [
      () => "First trade on the tape. Good. Nobody learns this job by watching.",
      () => "Saw your first order go through. Welcome to the actual job.",
    ],
  },
  bigGain: {
    from: "investors",
    variants: [
      (c) => `Saw that week (${pct(c.pct ?? 0)}). Investors are thrilled. Don't let it go to your head.`,
      (c) => `${pct(c.pct ?? 0)} in one week. The investor newsletter just got a lot easier to write.`,
      (c) => `A ${pct(c.pct ?? 0)} week. The board asked who you were. I said "ours."`,
    ],
  },
  bigLoss: {
    from: "founder",
    variants: [
      (c) => `Rough week (${pct(c.pct ?? 0)}). Everyone has them. What matters is what you do next Monday.`,
      (c) => `${pct(c.pct ?? 0)} this week. Breathe. The market has been doing this for a hundred years.`,
      (c) => `Down ${pct(Math.abs(c.pct ?? 0))} on the week. I've had worse before lunch. Stay disciplined.`,
    ],
  },
  allTimeHigh: {
    from: "investors",
    variants: [
      (c) => `New high for the book: ${money(c.amount ?? 0)}. The investors noticed. So did I.`,
      (c) => `${money(c.amount ?? 0)}, a new all-time high. Someone in the lobby is calling you a genius. Ignore them.`,
    ],
  },
  optionExpired: {
    from: "founder",
    variants: [
      (c) => `Your ${c.optionLabel} expired worthless. That's the premium you paid for the right, not the obligation. Lesson bought and paid for.`,
      (c) => `The ${c.optionLabel} ran out of time and finished out of the money. Options are a clock as much as a bet.`,
    ],
  },
  optionPaid: {
    from: "founder",
    variants: [
      (c) => `Your ${c.optionLabel} expired in the money and settled for ${money(c.amount ?? 0)}. Nicely timed.`,
      (c) => `${money(c.amount ?? 0)} just landed from your ${c.optionLabel}. That is what a good option looks like at the finish line.`,
    ],
  },
  yearEnd: {
    from: "founder",
    variants: [
      (c) =>
        `Year ${c.year} is in the books at ${pct(c.pct ?? 0)}. Your bonus is ${money(c.amount ?? 0)}. Spend it responsibly, or at least memorably.`,
    ],
  },
  promotion: {
    from: "founder",
    variants: [
      (c) => `You're ahead of buy-and-hold at the checkpoint. The nameplate now says ${c.title}. Congratulations.`,
    ],
  },
  finish: {
    from: "founder",
    variants: [
      () => "Five years. Come by the conference room, I have your review ready.",
    ],
  },
};

export function buildMessage(
  id: string,
  kind: MessageKind,
  week: number,
  date: string,
  ctx: MessageCtx,
): Message {
  const t = TEMPLATES[kind];
  const text = t.variants[week % t.variants.length](ctx);
  return { id, week, date, from: t.from, kind, text };
}
