/** Level 1: Training Day. Fifteen plain-English lessons with a quiz each. */

export type VisualKind =
  | "stock"
  | "spy"
  | "trade"
  | "buyhold"
  | "option"
  | "call"
  | "put"
  | "strike"
  | "expiry"
  | "premium"
  | "breakeven"
  | "risk"
  | "sharpe"
  | "drawdown"
  | "irr";

export interface Quiz {
  question: string;
  options: string[];
  /** index into options */
  answer: number;
  /** kind explanation shown after a wrong answer */
  explain: string;
}

export interface Lesson {
  id: string;
  term: string;
  title: string;
  /** two or three short sentences */
  body: string;
  /** one real-life style example with round numbers */
  example: string;
  visual: VisualKind;
  quiz: Quiz;
  /** one-line definition for the recap and glossary */
  glossary: string;
}

export const LESSONS: Lesson[] = [
  {
    id: "stock",
    term: "Stock",
    title: "What a stock is",
    body: "A stock is a small piece of a company. If a company is cut into 1,000,000 shares and you own 10 of them, you own a tiny slice of everything it does. When the company does well, people will pay more for each slice.",
    example: "You buy 1 share of a lemonade company for $100. The company grows and someone will now pay $120 for a share, so your slice is worth $120.",
    visual: "stock",
    quiz: {
      question: "If you own 10 shares of a company, what do you own?",
      options: ["A loan the company must pay back", "A small piece of the company", "The right to run the company"],
      answer: 1,
      explain: "Shares are slices of ownership. A loan would be a bond, and running the company is the job of its managers.",
    },
    glossary: "A small piece of a company that rises and falls in value with the company.",
  },
  {
    id: "spy",
    term: "SPY",
    title: "What SPY is",
    body: "SPY is a fund that holds the 500 biggest US companies in one package. Buying one share of SPY gives you a sliver of all 500 at once. That is why it moves with the overall market rather than with any single company.",
    example: "Put $100 into SPY: about $30 goes to the largest tech companies, a few dollars to banks, a few to retailers, and so on across all 500.",
    visual: "spy",
    quiz: {
      question: "Why does SPY move with the overall market?",
      options: ["It holds one very big company", "It holds the 500 biggest US companies", "Its price is set by the government"],
      answer: 1,
      explain: "SPY is a basket of 500 companies, so no single company drives it. It rises and falls with the market as a whole.",
    },
    glossary: "A fund holding the 500 biggest US companies, so it tracks the overall market.",
  },
  {
    id: "trade",
    term: "Buying and selling",
    title: "Buying and selling shares",
    body: "You make money when you sell shares for more than you paid, and lose money when you sell for less. Until you sell, a gain or loss is only on paper. Your cash buys shares at today's price, and selling turns them back into cash.",
    example: "Buy 10 shares at $100, costing $1,000. If the price rises to $110 and you sell, you get $1,100: a $100 profit. If it falls to $90 and you sell, you get $900: a $100 loss.",
    visual: "trade",
    quiz: {
      question: "You buy 10 shares at $100 and sell them at $95. What happened?",
      options: ["You made $50", "You lost $50", "Nothing, until the price recovers"],
      answer: 1,
      explain: "10 shares × $5 lower = $50 less than you paid. Once you sell, the loss is real, not just on paper.",
    },
    glossary: "You profit when you sell for more than you paid and lose when you sell for less.",
  },
  {
    id: "buyhold",
    term: "Buy-and-hold",
    title: "Buy-and-hold",
    body: "Buy-and-hold means buying once and never trading again. It sounds lazy, but over long periods it beats most active traders. That is why it is the benchmark you are trying to beat in this game.",
    example: "$100,000 that grows 10% a year becomes about $161,000 after five years without a single trade. To beat that, your trades have to add more than they cost you in mistakes.",
    visual: "buyhold",
    quiz: {
      question: "What does buy-and-hold mean?",
      options: ["Buy once and never trade", "Buy every week", "Buy and sell whenever the price moves"],
      answer: 0,
      explain: "Buy-and-hold is the do-nothing strategy: one purchase at the start, then patience. It is the gray line on your chart.",
    },
    glossary: "Buying once and never trading; the benchmark you try to beat.",
  },
  {
    id: "option",
    term: "Option",
    title: "What an option is",
    body: "An option is a contract that gives you the right, but not the obligation, to buy or sell shares at a set price before a deadline. You pay a small fee for that right. If using it would lose money, you simply let it go and lose only the fee.",
    example: "Pay $5 for the right to buy a share at $100 next month. If the stock jumps to $120, you use the right and come out ahead. If it falls to $80, you walk away and lose only the $5.",
    visual: "option",
    quiz: {
      question: "What does an option give you?",
      options: ["A duty to buy shares no matter what", "The right, but not the obligation, to buy or sell at a set price", "Free shares if the price rises"],
      answer: 1,
      explain: "The key word is right, not duty. You can use the option when it helps and ignore it when it doesn't; the fee is your only cost.",
    },
    glossary: "A contract giving the right, not the obligation, to buy or sell at a set price by a deadline.",
  },
  {
    id: "call",
    term: "Call option",
    title: "Call option",
    body: "A call is the right to buy shares at a set price. You buy a call when you think the price will rise. The higher the stock climbs above that price, the more the call is worth.",
    example: "A call with a $100 strike costs $5. The stock rises to $115: you can buy at $100 and sell at $115, a $15 gain, minus the $5 fee: $10 profit per share.",
    visual: "call",
    quiz: {
      question: "When would you buy a call?",
      options: ["When you think the price will fall", "When you think the price will rise", "When you want to earn interest"],
      answer: 1,
      explain: "A call is a bet on the price going up. Drag the slider to the right on the chart and watch the profit grow.",
    },
    glossary: "The right to buy at a set price; a bet that the price rises.",
  },
  {
    id: "put",
    term: "Put option",
    title: "Put option",
    body: "A put is the right to sell shares at a set price. You buy a put when you think the price will fall, or to protect shares you already own. The lower the stock drops below that price, the more the put is worth.",
    example: "A put with a $100 strike costs $5. The stock drops to $80: you can sell at $100 instead of $80, a $20 gain, minus the $5 fee: $15 profit per share. If you also own the shares, that profit softens their fall.",
    visual: "put",
    quiz: {
      question: "A put option makes money when the stock price…",
      options: ["Rises above the strike", "Falls below the strike by more than the fee", "Stays exactly the same"],
      answer: 1,
      explain: "A put pays when the price falls. It has to fall below the strike by more than the premium before you are ahead.",
    },
    glossary: "The right to sell at a set price; a bet that the price falls, or insurance for shares you own.",
  },
  {
    id: "strike",
    term: "Strike price",
    title: "Strike price",
    body: "The strike price is the set price written into the option: the price you may buy at (call) or sell at (put). It is fixed when you buy the option, no matter what the stock does afterwards. The further the strike is from today's price, the cheaper the option.",
    example: "The stock is at $100. A call with a $105 strike costs less than one with a $100 strike, because the stock has to climb further before the $105 call is worth anything.",
    visual: "strike",
    quiz: {
      question: "What is the strike price?",
      options: ["Today's stock price", "The set price you can buy or sell at with the option", "The fee you paid for the option"],
      answer: 1,
      explain: "The strike is the agreed price in the contract. Today's price moves every week; the strike never changes.",
    },
    glossary: "The set price in the option contract at which you may buy (call) or sell (put).",
  },
  {
    id: "expiry",
    term: "Expiration",
    title: "Expiration",
    body: "Every option has an end date, called the expiration. After that date the option is gone. In this game an option settles automatically at expiration for whatever it is worth, or for nothing.",
    example: "A 4-week call with a $100 strike expires with the stock at $103: it pays $3 per share. If the stock is at $97 that day, it pays nothing and the fee is gone.",
    visual: "expiry",
    quiz: {
      question: "What happens to an option at its expiration date?",
      options: ["It renews for another month", "It settles for what it is worth, which may be nothing", "You must buy the shares"],
      answer: 1,
      explain: "At expiration the clock runs out. The option pays its value if it has any, and otherwise it is worth zero.",
    },
    glossary: "The date an option ends and settles for whatever it is worth.",
  },
  {
    id: "premium",
    term: "Premium",
    title: "Premium",
    body: "The premium is the price you pay for an option. It is also the most you can lose when you buy one, no matter how badly the stock moves. Options cost more when the stock has been jumping around, because big moves are more likely.",
    example: "You pay a $5 premium per share, so $500 for one contract covering 100 shares. The stock then crashes 50%: you still lose only your $500.",
    visual: "premium",
    quiz: {
      question: "You buy a call for a $500 premium and the stock collapses. What is the most you can lose?",
      options: ["$500", "The full value of 100 shares", "There is no limit"],
      answer: 0,
      explain: "When you buy an option, the premium is your maximum loss. That is the floor you see on the payoff chart.",
    },
    glossary: "The price paid for an option, and the most a buyer can lose.",
  },
  {
    id: "breakeven",
    term: "Break-even",
    title: "Break-even",
    body: "Break-even is the stock price where the option pays back exactly what you spent. For a call it is the strike plus the premium; for a put it is the strike minus the premium. Beyond break-even you are making money.",
    example: "With a $100 strike and a $5 premium, a call breaks even at $105 and a put breaks even at $95. At $110 the call has made $5 per share.",
    visual: "breakeven",
    quiz: {
      question: "A call has a $100 strike and a $5 premium. Where is break-even?",
      options: ["$95", "$100", "$105"],
      answer: 2,
      explain: "For a call, break-even is the strike plus the premium: $100 + $5 = $105. Below that you are still paying back the fee.",
    },
    glossary: "The stock price where an option pays back its premium: strike plus premium for a call, minus for a put.",
  },
  {
    id: "risk",
    term: "Risk",
    title: "Risk",
    body: "Risk is how much a result can swing. Bigger potential gains almost always come with bigger potential losses. A good investor asks how much could I lose before asking how much could I make.",
    example: "A savings account pays 4% a year and never goes down. Stocks average about 10% a year but can fall 20% in a bad year. Options can double in a month or go to zero.",
    visual: "risk",
    quiz: {
      question: "Which is usually true about investments with bigger potential gains?",
      options: ["They are always safer", "They usually carry bigger potential losses", "They are guaranteed by the government"],
      answer: 1,
      explain: "Reward and risk travel together. If something could double, it could also fall hard; nothing offers big gains with no downside.",
    },
    glossary: "How much a result can swing; bigger possible gains come with bigger possible losses.",
  },
  {
    id: "sharpe",
    term: "Sharpe ratio",
    title: "Sharpe ratio",
    body: "The Sharpe ratio measures return per unit of risk. It takes what you earned above a safe T-bill (a short loan to the government) and divides it by how bumpy your ride was. Two players with the same return can have very different Sharpe ratios.",
    example: "Two players both earn 10% in a year. One's value climbed steadily (Sharpe about 1.5); the other's swung wildly up and down (Sharpe about 0.5). Same money, far less stress.",
    visual: "sharpe",
    quiz: {
      question: "Two players earn the same return. Who has the higher Sharpe ratio?",
      options: ["The one whose value swung more", "The one whose value moved more steadily", "They are always equal"],
      answer: 1,
      explain: "Sharpe rewards steadiness. Same return with smaller swings means more return per unit of risk.",
    },
    glossary: "Return earned per unit of risk: excess return over T-bills divided by volatility.",
  },
  {
    id: "drawdown",
    term: "Max drawdown",
    title: "Max drawdown",
    body: "Max drawdown is the biggest fall from a high point to a later low. It measures the worst stretch you lived through, which total return alone hides. Smaller is better.",
    example: "$100,000 grows to $120,000, drops to $90,000, then recovers to $130,000. The max drawdown is 25%: the fall from $120,000 to $90,000.",
    visual: "drawdown",
    quiz: {
      question: "Your portfolio goes $100k → $120k → $90k → $130k. What is the max drawdown?",
      options: ["10%", "25%", "30%"],
      answer: 1,
      explain: "The biggest peak-to-low fall is from $120k to $90k: $30k, which is 25% of the $120k peak.",
    },
    glossary: "The biggest drop from a peak to a later low.",
  },
  {
    id: "irr",
    term: "IRR",
    title: "IRR",
    body: "IRR is your average yearly return on the money invested. It turns a total gain over several years into a yearly rate you can compare with anything else. With one deposit and no additions, it is simply the yearly growth rate.",
    example: "$100,000 becomes $161,000 after 5 years. That is 61% in total, but the IRR is 10% a year, because 10% compounded five times gets you there.",
    visual: "irr",
    quiz: {
      question: "$100,000 grows to $161,000 over 5 years. Which is the IRR?",
      options: ["61% a year", "About 10% a year", "About 12% a year"],
      answer: 1,
      explain: "61% is the total gain. Spread over five years with compounding, it works out to about 10% per year.",
    },
    glossary: "The average yearly return on the money invested.",
  },
];

export const LESSON_COUNT = LESSONS.length;

export const GLOSSARY = LESSONS.map((l) => ({ term: l.term, text: l.glossary }));
