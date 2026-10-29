import { FOUNDER_NAME } from "./messages";

export interface Lesson {
  id: string;
  title: string;
  /** Two or three short sentences, plain English. */
  body: string;
}

export const TUTORIAL: Lesson[] = [
  {
    id: "welcome",
    title: `Welcome to Gothic Capital`,
    body: `I'm ${FOUNDER_NAME}, I started this fund. You have $100,000 and one ticker. We'll replay the last five years of real prices one week at a time, and you decide what to do each week.`,
  },
  {
    id: "shares",
    title: "Shares",
    body: "When you buy shares you own a small piece of the company (or fund). If the price goes up, you make money; if it goes down, you lose some. You can sell any time.",
  },
  {
    id: "call",
    title: "Call option",
    body: "A call is a small fee you pay for the right to buy at a set price (the strike) later. You profit if the price rises above the strike plus the fee you paid. If it doesn't, you just lose the fee.",
  },
  {
    id: "put",
    title: "Put option",
    body: "A put is the opposite: a fee for the right to sell at a set price later. You profit if the price falls below the strike minus your fee. It's a way to bet on, or protect against, a drop.",
  },
  {
    id: "benchmark",
    title: "Your benchmark: buy and hold",
    body: "Buy and hold means buying on day one and never touching it. That's the gray line on your main screen. Your job is to beat it, ideally with less risk. I'll check in along the way.",
  },
];

export const FAQ: Lesson[] = [
  ...TUTORIAL.slice(1),
  {
    id: "premium",
    title: "What is a premium?",
    body: "The premium is the price of an option: the fee you pay up front. It's the most you can lose on an option you buy. We price it with the Black-Scholes formula using recent volatility and the T-bill rate.",
  },
  {
    id: "expiry",
    title: "What happens when an option expires?",
    body: "At expiry we settle it in cash automatically. A call pays the amount the price is above the strike (times 100 shares per contract); a put pays the amount below. If it's on the wrong side, it expires worthless.",
  },
  {
    id: "breakEven",
    title: "Break-even and max loss",
    body: "Break-even is the price where the option pays back exactly what you spent. Max loss is the premium: buying options can never cost you more than you paid.",
  },
  {
    id: "sellEarly",
    title: "Can I sell an option early?",
    body: "Yes. Every week we re-price your options with Black-Scholes, and you can sell them back at that value from the positions list. Options lose value as time runs out, so don't wait if the trade has worked.",
  },
  {
    id: "volatility",
    title: "What is volatility?",
    body: "Volatility is how much the price has been jumping around lately. We measure it from the last 20 trading days. Higher volatility makes options more expensive, because big moves are more likely.",
  },
  {
    id: "sharpe",
    title: "Sharpe ratio",
    body: "Sharpe ratio is return earned per unit of risk. We take your weekly returns minus the T-bill rate, divide by how bumpy they were, and annualize. Higher is better; above 1 is good.",
  },
  {
    id: "drawdown",
    title: "Max drawdown",
    body: "Max drawdown is the biggest drop from a peak to a low along the way. It tells you how painful the worst stretch was, which returns alone hide.",
  },
  {
    id: "irr",
    title: "IRR",
    body: "IRR is the yearly return on the money invested. Since you started with one deposit and never added cash, it's (ending value / starting value) to the power of (1 / years), minus 1.",
  },
  {
    id: "rules",
    title: "House rules",
    body: "No borrowing and no short selling, so your cash can't go below zero. Each option contract covers 100 shares. Promotions happen at year 2 and year 4 if you're ahead of buy-and-hold.",
  },
];
