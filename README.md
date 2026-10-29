# Gothic Capital

A stock-trading simulation game built for a Duke finance class. You are a newly hired portfolio manager at Gothic Capital, a fictional hedge fund in Manhattan. The founder hands you **$100,000** and one ticker (SPY by default, or any ticker you type). The game replays the **last five years of real weekly prices**, one week at a time. At the end, the founder sits you down for a performance review that compares your results to simply buying and holding.

No login, no sign-up, no API keys. Open the link and play.

## What you can do each week

- **Buy or sell shares** (no borrowing, no short selling: cash never goes below zero).
- **Buy a call or a put option.** You choose the expiry (4 or 12 weeks) and the strike (at the current price, or 5% above or below it). Each contract covers 100 shares. Before you buy, a preview shows the cost, break-even price, max loss, and a payoff chart.
- **Sell an option you own** before it expires, at its current model value.
- **Hold.** Press *Next week*, *Skip 4 weeks*, or turn on *Auto-play* (1x, 2x, 4x). Auto-play pauses whenever an option expires and at each year-end bonus.

On day one the founder offers a **practice round**: a guided, nine-week run with play money that walks through reading the screen, buying and selling shares, buying a call and a put, fast-forwarding to their expiry, and reading the three scoring metrics. Each step's founder note floats next to the exact control to click (positioned with Floating UI, with an arrow and a pulsing glow on the target) and waits for you; wrong clicks get a gentle nudge, and *Skip tutorial* is always available. Nothing in the practice round counts: the real game starts fresh at $100,000. Replay it any time from the help panel. The founder also stays available through *Ask the founder*, and the round **?** button in the top right opens a help panel with a "what to do next" tip based on the current state, one-line definitions of the key terms, and links to the practice round and the founder's answers. Inbox messages from the founder and investors arrive at key moments (first trade, big weekly gains or losses, new all-time highs, option expiries, year end, promotions). Your job title on the desk nameplate goes from Junior PM to Portfolio Manager (year 2) to Senior PM (year 4) if you are beating buy-and-hold at those checkpoints. The coffee mug refills every week and the office light shifts from morning to afternoon to evening as the weeks go by.

## Where the data comes from and how it updates

- Prices come from Yahoo Finance through the [`yahoo-finance2`](https://www.npmjs.com/package/yahoo-finance2) npm package (its `chart()` method), fetched server-side by the Next.js route `app/api/prices/route.ts`. Nothing is fetched from the browser and no API key is needed.
- For each ticker the route pulls **5 years of weekly bars** (the game timeline) and **5 years of daily bars** (used only to compute 20-trading-day historical volatility for option pricing). The game uses **adjusted close** prices, so dividends and splits are reflected fairly in both your results and the buy-and-hold benchmark.
- The **risk-free rate** is the 13-week Treasury bill yield, Yahoo symbol `^IRX`, pulled weekly. Its value is an annualized percent (e.g. 4.25). The rate in effect at each game week is the latest `^IRX` close on or before that week.
- Every new game fetches fresh data, so the five-year window always ends at the most recent week. Results are cached in memory for one hour per server process.
- **Backup snapshot.** `data/snapshot/SPY.json` and `data/snapshot/IRX.json` hold a copy of the SPY and `^IRX` series. If the live fetch fails or is rate-limited, the SPY game quietly falls back to the snapshot (the main monitor's header says "backup snapshot"). Refresh the snapshot with `npm run snapshot`. Other tickers need the live fetch; if it fails, the start screen says so and suggests SPY.
- The game never invents news or market events. Everything you see is real price and rate data.

## How options are priced and settled

- Premiums use the **Black-Scholes** formula (`lib/blackScholes.ts`) with:
  - spot = this week's adjusted close,
  - strike = spot, spot × 1.05, or spot × 0.95,
  - time to expiry = 4/52 or 12/52 years,
  - risk-free rate = the current `^IRX` yield,
  - volatility = annualized standard deviation of the last 20 daily log returns (× √252), falling back to 20% only if there is not enough history.
- Each week, open options are re-marked with the same formula and the remaining time. You can sell them back at that value.
- At expiry, options settle automatically in cash at intrinsic value: a call pays max(0, price − strike) × 100 × contracts; a put pays max(0, strike − price) × 100 × contracts. Out-of-the-money options expire worthless.

## How each metric is calculated

Both the player and buy-and-hold are measured with the **same function** (`computeStats` in `lib/metrics.ts`) on their weekly value series, so the comparison is apples to apples. Buy-and-hold means putting the full $100,000 into the ticker at the first week's price and never trading.

- **Sharpe ratio**: return earned per unit of risk. For each week, excess return = weekly portfolio return − (annual `^IRX` yield ÷ 100 ÷ 52). Sharpe = mean(excess) ÷ sample standard deviation(excess) × √52. If the portfolio value never moved (for example, all cash the whole time) the ratio is undefined and shown as 0.
- **Max drawdown**: the biggest drop from a running peak to a later low, as a percentage of the peak.
- **IRR**: the yearly return on the money invested. With one starting deposit and no later cash flows this is (ending value ÷ starting value)^(1 ÷ years) − 1, where years = weeks elapsed ÷ 52.

The year-end bonus is a fun flourish, not a metric: $2,500 base, plus $50,000 × that year's return if positive, plus $5,000 if you are ahead of buy-and-hold at year end.

## Running locally

```bash
npm install
npm run dev        # http://localhost:3000
npm test           # unit tests: Black-Scholes, metrics, engine, and a full 5-year game
npm run snapshot   # refresh data/snapshot/*.json from Yahoo Finance
npm run build
```

## Deploying

The app is a standard Next.js project. On Vercel, import the GitHub repository and deploy with the defaults: no environment variables are required. The price route runs on the Node.js runtime so it can use `yahoo-finance2`.

## Project layout

```
app/api/prices/route.ts   live fetch with snapshot fallback
lib/engine.ts             pure game rules: trades, options, weekly step, events
lib/blackScholes.ts       option pricing and historical volatility
lib/metrics.ts            Sharpe, max drawdown, IRR
lib/messages.ts           founder and investor messages
components/office/        SVG office and conference-room scenes
components/monitors/      the three monitors (charts, order ticket, inbox)
components/ReviewScreen.tsx  end-of-game performance review
tests/                    vitest unit tests (npm test)
data/snapshot/            backup SPY and ^IRX data
```

Tech: Next.js (App Router, TypeScript), Tailwind CSS, Framer Motion, Recharts, yahoo-finance2, Vitest. The office is drawn with SVG and CSS; there are no stock photos, logos, or brand names.
