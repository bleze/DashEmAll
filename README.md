# DashEmAll

A single-file, no-build portfolio ledger for stocks and crypto. Open `web/index.html` directly in a browser — there's no server, no bundler, and no backend. Holdings are stored in the browser's `localStorage`, so your data stays on the machine you added it on.

## Running it

Open `web/index.html` in a browser (double-click, or run `web/open.bat` on Windows). That's the whole setup.

If you'd rather serve it over `http://` (some browsers/extensions behave more predictably with fetch than with `file://`), any static file server works, e.g. from `web/`:

```
npx serve .
```

## What it does

- Add stock and crypto tickers with a quantity, an optional average cost basis, and an optional free-text tag (e.g. "Cold storage", "Coinbase", "Nordnet") for where it's held. The same symbol can appear multiple times under different tags — they're tracked as separate lots, not merged, so "BTC on an exchange" and "BTC in cold storage" show as distinct rows while still rolling up into the shared totals.
- Live-ish price refresh every 30 seconds (Yahoo Finance for stocks, CoinGecko/Binance for crypto), with USD + your chosen local-currency totals, daily change, and P/L when a cost basis is set.
- Each holding flags itself "stale" if its price hasn't refreshed successfully in a while (4 missed refresh cycles), even if the overall status still says "Live" because other holdings refreshed fine — a per-symbol fetch failure otherwise fails silently.
- A "Value over time" chart (inline SVG, no charting library) built from one snapshot per calendar day, kept in `localStorage` — needs at least two days of data before a trend line appears.
- Settings (gear button, top right) let you pick a local currency shown alongside USD (DKK/EUR/GBP/SEK/NOK/USD), a 12/24-hour clock, and a timezone to display the clock/date in — all independent of USD, which is always the base currency everything is computed in.
- A scrolling "Wire" headline ticker plus a couple of headlines per holding, sourced from Yahoo Finance's news search first, with Google News RSS and a filtered Hacker News search as fallbacks.
- Everything persists to `localStorage`; no accounts, no sync, no server-side storage.

## How it's built

Plain HTML/CSS/JS, no framework and no build step:

- `web/index.html` — page shell with three containers inside `#app` (`#app-head`, `#app-tape`, `#app-body`), loads `app.js` and `styles.css`.
- `web/app.js` — all application logic: state, rendering, price/news fetching, and event delegation on `#app`.
- `web/styles.css` — styling.

### Rendering

`render()` rebuilds `#app-head` (header, hero totals) and `#app-body` (holdings panel, add/edit/settings dialogs) from the in-memory `state` object on every state change — there's no diffing, just `innerHTML` replacement. The scrolling wire ticker is the one exception: it lives in its own `#app-tape` container and is only touched by `updateTape()` when the rendered headlines actually change. It's rendered by the same `render()` call that updates everything else, but a fresh DOM node would restart the CSS marquee animation, and quote refreshes (every 30s) are far more frequent than headline changes (every 5min) — so it's skipped whenever the headline HTML is unchanged from last time.

### Data sources and their quirks

Because this is a static page with no backend, price and news data come straight from third-party APIs called from the browser:

- **Crypto quotes** — CoinGecko (direct, CORS-friendly) with a Binance fallback for BTC.
- **Stock quotes & ticker search** — Yahoo Finance. Yahoo does not send CORS headers, so browser requests to it are proxied through public CORS relays (allorigins.win, corsproxy.io, r.jina.ai raced in parallel) as a best-effort fallback. These relays are unreliable by nature (rate limits, outages), so:
  - Ticker search resolves against a small built-in directory of common tickers first, so the dropdown never depends on those relays being up. A live Yahoo lookup is merged in on top when it succeeds.
  - Quote refreshes silently keep the last known price if a symbol's fetch fails.
- **News** — tried in order per holding: Yahoo Finance's own news-search results (relevant, fresh, includes real article thumbnails), then Google News RSS (scraped via the same proxy relays — Google actively rate-limits/blocks that proxy traffic, so treat it as a bonus, not a given), then Hacker News (Algolia search_by_date, kept only if the story title actually contains the company/asset name — Algolia's search is fuzzy enough to otherwise return unrelated stories). Anything older than 14 days is dropped rather than shown as if it were current. When a result has no real thumbnail, the publisher's favicon is used instead.
- **FX rates** — open.er-api.com, with frankfurter.dev as a fallback.

### Known limitations

- No build tooling, no tests, no TypeScript — it's intentionally a single hand-editable file.
- Price/news freshness depends entirely on third-party API availability; there's no caching layer beyond what's needed to avoid a blank UI while offline.
- The local ticker directory in `app.js` covers common US large-caps/ETFs and a handful of Nordic tickers — anything else falls back to whatever the live Yahoo search (if reachable) or the typed symbol resolves to.
- Settings (`dashemall.settings` in `localStorage`) only offer a curated set of currencies and timezones, not every IANA zone / ISO currency code.
- History (`dashemall.history`) is one point per calendar day (whichever value was last recorded that day), capped at 365 points — it's a trend indicator, not an intraday chart.
