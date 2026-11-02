# Gothic Capital

A stock-trading simulation game built for a Duke finance class. You are a newly hired portfolio manager at Gothic Capital, a fictional hedge fund in Manhattan. The founder hands you **$100,000** and one ticker (SPY by default, or any ticker you type). The game replays the **last five years of real weekly prices**, one week at a time. At the end, the founder sits you down for a performance review that compares your results to simply buying and holding.

No login, no sign-up, no API keys. Open the link and play.

## What you can do each week

- **Buy or sell shares** (no borrowing, no short selling: cash never goes below zero).
- **Buy a call or a put option.** You choose the expiry (4 or 12 weeks) and the strike (at the current price, or 5% above or below it). Each contract covers 100 shares. Before you buy, a preview shows the cost, break-even price, max loss, and a payoff chart.
- **Sell an option you own** before it expires, at its current model value.
- **Hold.** Press *Next week*, *Skip 4 weeks*, or turn on *Auto-play* (1x, 2x, 4x). Auto-play pauses whenever an option expires and at each year-end bonus. The clock only starts after your first trade, so a five-year all-cash run isn't possible by accident; if you never trade, the founder's closing line says so.

The game has three levels, shown as a progress path after you pick a ticker; you can start at any level and a checkmark marks each one you finish (saved in your browser).

**Level 1: Training Day** teaches the vocabulary before any trading: fifteen short lessons on the middle monitor (stock, SPY, buying and selling, buy-and-hold, options, calls, puts, strike, expiration, premium, break-even, risk, Sharpe ratio, max drawdown, IRR), each with a plain-English explanation, a small visual, a round-number example and one multiple-choice question. Wrong answers get a kind explanation and another try; the option lessons have a draggable payoff chart. You can jump between lessons from the list on the right monitor. Finishing shows a recap of all fifteen terms, adds a "Training Day" tombstone award to the desk, and unlocks Level 2. All fifteen definitions live in the glossary behind the ? button.

**Level 2** is the practice round and **Level 3** is the real game. On day one the founder offers the **practice round**: a guided run over the most recent nine weeks of real prices with play money that walks through reading the screen, buying and selling shares, buying a call and a put, fast-forwarding to their expiry, and reading the three scoring metrics. Each step's founder note floats next to the exact control to click (an ✕ collapses it to a small pill until the next step) (positioned with Floating UI, with an arrow and a pulsing glow on the target) and waits for you; wrong clicks get a gentle nudge, and *Skip tutorial* is always available. Nothing in the practice round counts: the real game starts fresh at $100,000. Replay it any time from the help panel. The founder also stays available through *Ask the founder*, and the round **?** button in the top right opens a help panel with a "what to do next" tip based on the current state, one-line definitions of the key terms, and links to the practice round and the founder's answers. Inbox messages from the founder and investors arrive at key moments (first trade, big weekly gains or losses, new all-time highs, option expiries, year end, promotions). Your name (typed on the start screen) and job title sit on the desk nameplate; the title goes from Junior PM to Portfolio Manager (year 2) to Senior PM (year 4) if you are beating buy-and-hold at those checkpoints, and each promotion adds a lucite "tombstone" award to the desk, alongside one for finishing Training Day. The coffee mug refills every week and the office light shifts from morning to afternoon to evening as the weeks go by.

## Where the data comes from and how it updates

- You can type any ticker or company name on the start screen. Symbols are normalized (BRK.B becomes BRK-B) and anything Yahoo doesn't recognize as a symbol is looked up with Yahoo's search, so "Apple" resolves to AAPL. Tickers with less than five years of history simply play a shorter game (minimum 26 weeks).
- Prices come from Yahoo Finance through the [`yahoo-finance2`](https://www.npmjs.com/package/yahoo-finance2) npm package (its `chart()` method), fetched server-side by the Next.js route `app/api/prices/route.ts`. Nothing is fetched from the browser and no API key is needed.
- For each ticker the route pulls **5 years of weekly bars** (the game timeline) and **5 years of daily bars** (used to compute 20-trading-day historical volatility for option pricing). The game uses **adjusted close** prices, so dividends and splits are reflected fairly in both your results and the buy-and-hold benchmark.
- Each weekly bar is dated by the week's **last trading day** (usually Friday; Thursday in a holiday-shortened week), taken from the daily series. The current week is left out until its Friday has passed, so the game always ends on the latest completed trading week, and the window is trimmed to exactly the most recent five years. The chart header shows "Data as of [date] · Source: Yahoo Finance", with "Using saved data" appended if the backup snapshot is in use.
- The **risk-free rate** is the 13-week Treasury bill yield, Yahoo symbol `^IRX`, pulled weekly. Its value is an annualized percent (e.g. 4.25). The rate in effect at each game week is the latest `^IRX` close on or before that week's last trading day. For the Sharpe ratio it is converted to a weekly rate (annual % ÷ 100 ÷ 52); for Black-Scholes it is used as the annual rate with time to expiry in years, which is the form the formula expects.
- Every new game fetches fresh data, so the five-year window always ends at the most recent week. Results are cached in memory for one hour per server process.
- **Backup snapshot.** `data/snapshot/SPY.json` and `data/snapshot/IRX.json` hold a copy of the SPY and `^IRX` series. If the live fetch fails or is rate-limited, the SPY game quietly falls back to the snapshot (the main monitor's header says "backup snapshot"). Refresh the snapshot with `npm run update-data` before a deploy if you want the file itself current. In practice the file is rarely needed: every game start fetches live data, the server caches each successful fetch and reuses it if Yahoo fails later, and only if neither is available does the SPY game fall back to the file. Other tickers need the live fetch; if it fails, the start screen says so and suggests SPY.
- The game calendar starts on the day you open the app and advances one week per step; the prices behind it are the real weekly history of the last five years (the chart header notes the real start date). The game never invents news or market events. Everything you see is real price and rate data.

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
npm run update-data   # refresh data/snapshot/*.json from Yahoo Finance
npm run audit-data    # print Yahoo weekly closes at five dates for SPY/AAPL/MSFT for cross-checking
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

On phones and narrow windows (under 900px wide) the game switches to a stacked layout: a header with the date, cash and portfolio value, tabs for Chart, Trade and Inbox (Lesson and Lessons during Training Day), and a bottom bar with the week controls. The practice coach becomes a sheet above the bar and follows you to the right tab. Same engine, data and scoring as the desktop version.

Tech: Next.js (App Router, TypeScript), Tailwind CSS, Framer Motion, Recharts, yahoo-finance2, Vitest. The office is drawn with SVG and CSS; there are no stock photos, logos, or brand names.
