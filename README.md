# DashEmAll

A single-file, no-build portfolio ledger for stocks and crypto. Open `index.html` directly in a browser — there's no server, no bundler, and no backend. Holdings are stored in the browser's `localStorage`, so your data stays on the machine you added it on.

## Running it

Open `index.html` in a browser (double-click, or run `open.bat` on Windows). That's the whole setup.

If you'd rather serve it over `http://`, any static file server works, e.g. from the repo root:

```
npx serve .
```

## What it does

- Add stock and crypto tickers with a quantity, an optional average cost basis, and an optional free-text tag for where it's held (e.g. "Cold storage", "Coinbase", "Nordnet"). The same symbol can appear multiple times under different tags, tracked as separate lots that still roll up into the shared totals.
- The add dialog has a Ticker/Cash type toggle. Cash holdings are a currency (DKK/EUR/GBP/SEK/NOK/USD) and an amount rather than a ticker — no live quote (Price shows "—"), no daily-change badge, no cost basis, no news/sparkline (its card says so instead of the usual "Listening for headlines…"). They roll into the same USD/local totals as everything else, and get their own "Cash" stat card once you have one.
- A per-tag value breakdown sits above the holdings list whenever more than one tag is in use. Clicking a tag filters the list to it (multiple tags OR together); with none selected, everything shows. Each tag gets a color derived from its text, used consistently everywhere it appears.
- A Sort control next to Refresh/Add holding orders the list by Value (default), Today's %, P/L, or Symbol. The choice persists across reloads.
- Live price refresh every 30 seconds (Yahoo Finance for stocks, CoinGecko/Binance for crypto), with totals in USD plus your chosen local currency. The Total Value card carries a "Today" figure (USD + local, stacked like the ticker cards) and a day-change % badge top-right — the same layout every holding card uses. The 🪙📈💵 Bitcoin & crypto / Stocks / Cash stat cards follow suit: a %-of-portfolio badge top-right, USD value, local-currency value stacked below it, then the position count.
- Each holding card shows quantity, price, USD/local value, and P/L, plus a faded 30-day price sparkline behind the card and the day's % change next to the symbol. A holding flags itself "stale" if its price hasn't refreshed in a while. Quantities and prices are formatted in whatever locale your chosen local currency implies (da-DK's "." thousands / "," decimal for DKK, and so on) — not hardcoded to US notation.
- The total-value card shows a value-over-time trend line and a "+$X · +Y% since &lt;date&gt;" figure, built from one snapshot per day.
- A scrolling "Wire" headline ticker, plus up to 3 headlines per holding with icons where available.
- Settings let you pick a local currency (DKK/EUR/GBP/SEK/NOK/USD, with the current USD/local exchange rate shown right there), a 12/24-hour clock, and a timezone — independent of USD, which is always the base currency. Export/Import lets you carry holdings, settings, and history between browsers or URLs, and doubles as a manual backup.
- Precious metals (gold, silver, platinum, palladium) are searchable by name and priced per troy ounce.
- A Privacy toggle (top right, next to Settings) blurs everything that reveals position size or net worth — quantities, USD/local values, P/L — while leaving composition fully readable: symbols, tags, allocation %, day-change %, and per-share price all stay visible. Meant for sharing a screenshot of what you hold and how it's divided without revealing how much it's worth. Hover a blurred figure to peek at it without leaving privacy mode. Not persisted — resets to off on reload.
- A "Save image" button (next to Privacy) exports the entire ledger — including holdings below the fold that don't fit in the window — as a downloaded PNG. If Privacy is on, the exported image redacts the same figures with solid bars rather than blur, so the file itself never contains the underlying numbers.
- Every currency figure in the app draws its cents/øre dimmer than the whole-number part (a darker version of whatever color that figure already is — muted white normally, a darker green/red inside a colored P/L number).

## How it's built

Plain HTML/CSS/JS, no framework, no build step:

- `index.html` — page shell with three containers inside `#app` (`#app-head`, `#app-tape`, `#app-body`).
- `app.js` — all application logic: state, rendering, price/news fetching, event handling.
- `styles.css` — styling.
- `html2canvas.min.js` — the one vendored third-party file, used only by "Save image" to rasterize the ledger to PNG. No CDN calls; it ships in the repo.

`render()` rebuilds `#app-head` and `#app-body` from the in-memory `state` object on every change — no diffing, just `innerHTML` replacement. The scrolling wire ticker lives in its own `#app-tape` container and only re-renders when its content actually changes, so its CSS animation isn't restarted by unrelated updates.

### Data sources

- **Crypto quotes** — CoinGecko (BTC/ETH/SOL resolve directly; anything else resolves via CoinGecko's coin search first), with a Binance fallback for BTC.
- **Stock quotes & ticker search** — Yahoo Finance, reached through public CORS relays since Yahoo doesn't send CORS headers itself. Ticker search checks a small built-in directory of common tickers first (instant, no network dependency), then merges in a live Yahoo result if one arrives.
- **Sparkline history** (per-holding 30-day price line) — fetched separately from the price quote, on a 6-hour cadence rather than every 30 seconds. Crypto sparklines resolve the coin the same way crypto quotes do (not limited to BTC/ETH/SOL).
- **News** — tried in order per holding: Yahoo Finance's news search, then Google News RSS, then Hacker News (Algolia), filtered to results that actually mention the company/asset and are less than 14 days old.
- **FX rates** — open.er-api.com, with frankfurter.dev as a fallback.
- **Cash holdings** — no data source at all. A synthetic quote (`price: 1` in the chosen currency) plugs into the same value/P&L/history math as everything else, with no network call.

### Known limitations

- No build tooling, no tests, no TypeScript — a single hand-editable file by design.
- Price/news freshness depends on third-party API availability; there's no server-side caching layer.
- The local ticker directory covers common US large-caps/ETFs, a handful of Nordic tickers, and precious metals — anything else depends on the live Yahoo search or the typed symbol resolving directly. Metals are bucketed under "Stocks" since there's no third category.
- Settings only offer a curated set of currencies and timezones, not every ISO code / IANA zone.
- Value history is one point per calendar day, capped at 365 points — a trend indicator, not an intraday chart.
