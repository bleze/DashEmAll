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
- A per-tag value breakdown sits above the holdings list whenever more than one tag is in use. Clicking a tag filters the list to it (multiple tags OR together); with none selected, everything shows. Each tag gets a color derived from its text, used consistently everywhere it appears.
- Live price refresh every 30 seconds (Yahoo Finance for stocks, CoinGecko/Binance for crypto), with totals in USD plus your chosen local currency, daily change, and profit/loss when a cost basis is set.
- Each holding card shows quantity, price, USD/local value, and P/L, plus a faded 30-day price sparkline behind the card and the day's % change next to the symbol. A holding flags itself "stale" if its price hasn't refreshed in a while.
- The total-value card shows a value-over-time trend line and a "+$X · +Y% since &lt;date&gt;" figure, built from one snapshot per day.
- A scrolling "Wire" headline ticker, plus up to 3 headlines per holding with icons where available.
- Settings let you pick a local currency (DKK/EUR/GBP/SEK/NOK/USD), a 12/24-hour clock, and a timezone — independent of USD, which is always the base currency. Export/Import lets you carry holdings, settings, and history between browsers or URLs, and doubles as a manual backup.
- Precious metals (gold, silver, platinum, palladium) are searchable by name and priced per troy ounce.
- Every currency figure in the app draws its cents/øre dimmer than the whole-number part (a darker version of whatever color that figure already is — muted white normally, a darker green/red inside a colored P/L number).

## How it's built

Plain HTML/CSS/JS, no framework, no build step:

- `index.html` — page shell with three containers inside `#app` (`#app-head`, `#app-tape`, `#app-body`).
- `app.js` — all application logic: state, rendering, price/news fetching, event handling.
- `styles.css` — styling.

`render()` rebuilds `#app-head` and `#app-body` from the in-memory `state` object on every change — no diffing, just `innerHTML` replacement. The scrolling wire ticker lives in its own `#app-tape` container and only re-renders when its content actually changes, so its CSS animation isn't restarted by unrelated updates.

### Data sources

- **Crypto quotes** — CoinGecko, with a Binance fallback for BTC.
- **Stock quotes & ticker search** — Yahoo Finance, reached through public CORS relays since Yahoo doesn't send CORS headers itself. Ticker search checks a small built-in directory of common tickers first (instant, no network dependency), then merges in a live Yahoo result if one arrives.
- **Sparkline history** (per-holding 30-day price line) — fetched separately from the price quote, on a 6-hour cadence rather than every 30 seconds.
- **News** — tried in order per holding: Yahoo Finance's news search, then Google News RSS, then Hacker News (Algolia), filtered to results that actually mention the company/asset and are less than 14 days old.
- **FX rates** — open.er-api.com, with frankfurter.dev as a fallback.

### Known limitations

- No build tooling, no tests, no TypeScript — a single hand-editable file by design.
- Price/news freshness depends on third-party API availability; there's no server-side caching layer.
- The local ticker directory covers common US large-caps/ETFs, a handful of Nordic tickers, and precious metals — anything else depends on the live Yahoo search or the typed symbol resolving directly. Metals are bucketed under "Stocks" since there's no third category.
- Settings only offer a curated set of currencies and timezones, not every ISO code / IANA zone.
- Value history is one point per calendar day, capped at 365 points — a trend indicator, not an intraday chart.
