"use strict";

const HOLDINGS_KEY = "dashemall.holdings";
const CACHE_KEY = "dashemall.quotesCache";
const NEWS_KEY = "dashemall.news";
const SETTINGS_KEY = "dashemall.settings";
const REFRESH_MS = 30_000;
const NEWS_MS = 5 * 60_000;

const CURRENCY_OPTIONS = [
  { code: "DKK", label: "Danish krone" },
  { code: "EUR", label: "Euro" },
  { code: "GBP", label: "British pound" },
  { code: "SEK", label: "Swedish krona" },
  { code: "NOK", label: "Norwegian krone" },
  { code: "USD", label: "US dollar" },
];
const CURRENCY_LOCALES = {
  USD: "en-US",
  DKK: "da-DK",
  EUR: "de-DE",
  GBP: "en-GB",
  SEK: "sv-SE",
  NOK: "nb-NO",
};
const TIME_FORMAT_OPTIONS = [
  { value: "auto", label: "Match browser" },
  { value: "24", label: "24-hour" },
  { value: "12", label: "12-hour (AM/PM)" },
];
const TIMEZONE_OPTIONS = [
  { value: "auto", label: "Match browser" },
  { value: "Europe/Copenhagen", label: "Copenhagen" },
  { value: "Europe/London", label: "London" },
  { value: "America/New_York", label: "New York" },
  { value: "America/Los_Angeles", label: "Los Angeles" },
  { value: "Asia/Tokyo", label: "Tokyo" },
  { value: "UTC", label: "UTC" },
];
const DEFAULT_SETTINGS = { localCurrency: "DKK", timeFormat: "auto", timezone: "auto" };

const CRYPTO = {
  "BTC-USD": { id: "bitcoin", name: "Bitcoin" },
  BTC: { id: "bitcoin", name: "Bitcoin" },
  BITCOIN: { id: "bitcoin", name: "Bitcoin" },
  "ETH-USD": { id: "ethereum", name: "Ethereum" },
  ETH: { id: "ethereum", name: "Ethereum" },
  ETHEREUM: { id: "ethereum", name: "Ethereum" },
  "SOL-USD": { id: "solana", name: "Solana" },
  SOL: { id: "solana", name: "Solana" },
};

const QUICK_ADDS = [
  { symbol: "BTC-USD", label: "Bitcoin" },
  { symbol: "ETH-USD", label: "Ethereum" },
  { symbol: "AAPL", label: "Apple" },
  { symbol: "MSFT", label: "Microsoft" },
  { symbol: "NVDA", label: "Nvidia" },
  { symbol: "GOOGL", label: "Alphabet" },
  { symbol: "AMZN", label: "Amazon" },
  { symbol: "NOVO-B.CO", label: "Novo Nordisk" },
  { symbol: "VWS.CO", label: "Vestas" },
  { symbol: "SPY", label: "S&P 500" },
];

// Resolved locally first so the search dropdown never depends on Yahoo Finance
// being reachable through a public CORS proxy (those go down/rate-limit often).
// Live results from Yahoo are merged in on top of this when they arrive.
const STOCK_DIRECTORY = [
  { symbol: "AAPL", name: "Apple", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "MSFT", name: "Microsoft", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "NVDA", name: "Nvidia", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "GOOGL", name: "Alphabet (Class A)", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "GOOG", name: "Alphabet (Class C)", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "AMZN", name: "Amazon", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "META", name: "Meta Platforms", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "TSLA", name: "Tesla", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "BRK-B", name: "Berkshire Hathaway", type: "EQUITY", exchange: "NYSE" },
  { symbol: "JPM", name: "JPMorgan Chase", type: "EQUITY", exchange: "NYSE" },
  { symbol: "V", name: "Visa", type: "EQUITY", exchange: "NYSE" },
  { symbol: "MA", name: "Mastercard", type: "EQUITY", exchange: "NYSE" },
  { symbol: "UNH", name: "UnitedHealth Group", type: "EQUITY", exchange: "NYSE" },
  { symbol: "JNJ", name: "Johnson & Johnson", type: "EQUITY", exchange: "NYSE" },
  { symbol: "WMT", name: "Walmart", type: "EQUITY", exchange: "NYSE" },
  { symbol: "PG", name: "Procter & Gamble", type: "EQUITY", exchange: "NYSE" },
  { symbol: "HD", name: "Home Depot", type: "EQUITY", exchange: "NYSE" },
  { symbol: "XOM", name: "Exxon Mobil", type: "EQUITY", exchange: "NYSE" },
  { symbol: "CVX", name: "Chevron", type: "EQUITY", exchange: "NYSE" },
  { symbol: "KO", name: "Coca-Cola", type: "EQUITY", exchange: "NYSE" },
  { symbol: "PEP", name: "PepsiCo", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "MRK", name: "Merck", type: "EQUITY", exchange: "NYSE" },
  { symbol: "ABBV", name: "AbbVie", type: "EQUITY", exchange: "NYSE" },
  { symbol: "AVGO", name: "Broadcom", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "ORCL", name: "Oracle", type: "EQUITY", exchange: "NYSE" },
  { symbol: "CRM", name: "Salesforce", type: "EQUITY", exchange: "NYSE" },
  { symbol: "ADBE", name: "Adobe", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "NFLX", name: "Netflix", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "AMD", name: "Advanced Micro Devices", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "INTC", name: "Intel", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "IBM", name: "IBM", type: "EQUITY", exchange: "NYSE" },
  { symbol: "CSCO", name: "Cisco Systems", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "QCOM", name: "Qualcomm", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "TXN", name: "Texas Instruments", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "PYPL", name: "PayPal", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "DIS", name: "Walt Disney", type: "EQUITY", exchange: "NYSE" },
  { symbol: "NKE", name: "Nike", type: "EQUITY", exchange: "NYSE" },
  { symbol: "MCD", name: "McDonald's", type: "EQUITY", exchange: "NYSE" },
  { symbol: "SBUX", name: "Starbucks", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "BA", name: "Boeing", type: "EQUITY", exchange: "NYSE" },
  { symbol: "CAT", name: "Caterpillar", type: "EQUITY", exchange: "NYSE" },
  { symbol: "GE", name: "General Electric", type: "EQUITY", exchange: "NYSE" },
  { symbol: "F", name: "Ford Motor", type: "EQUITY", exchange: "NYSE" },
  { symbol: "GM", name: "General Motors", type: "EQUITY", exchange: "NYSE" },
  { symbol: "UBER", name: "Uber Technologies", type: "EQUITY", exchange: "NYSE" },
  { symbol: "ABNB", name: "Airbnb", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "SHOP", name: "Shopify", type: "EQUITY", exchange: "NYSE" },
  { symbol: "SQ", name: "Block", type: "EQUITY", exchange: "NYSE" },
  { symbol: "COIN", name: "Coinbase Global", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "PLTR", name: "Palantir Technologies", type: "EQUITY", exchange: "NYSE" },
  { symbol: "SOFI", name: "SoFi Technologies", type: "EQUITY", exchange: "NASDAQ" },
  { symbol: "SPY", name: "S&P 500", type: "ETF", exchange: "NYSEARCA" },
  { symbol: "QQQ", name: "Nasdaq 100", type: "ETF", exchange: "NASDAQ" },
  { symbol: "DIA", name: "Dow Jones Industrial Average", type: "ETF", exchange: "NYSEARCA" },
  { symbol: "IWM", name: "Russell 2000", type: "ETF", exchange: "NYSEARCA" },
  { symbol: "VTI", name: "Vanguard Total Stock Market", type: "ETF", exchange: "NYSEARCA" },
  { symbol: "VOO", name: "Vanguard S&P 500", type: "ETF", exchange: "NYSEARCA" },
  { symbol: "ARKK", name: "ARK Innovation", type: "ETF", exchange: "NYSEARCA" },
  { symbol: "GLD", name: "SPDR Gold Shares", type: "ETF", exchange: "NYSEARCA" },
  { symbol: "SLV", name: "iShares Silver Trust", type: "ETF", exchange: "NYSEARCA" },
  { symbol: "NOVO-B.CO", name: "Novo Nordisk", type: "EQUITY", exchange: "CPH" },
  { symbol: "VWS.CO", name: "Vestas Wind Systems", type: "EQUITY", exchange: "CPH" },
  { symbol: "MAERSK-B.CO", name: "A.P. Møller - Mærsk", type: "EQUITY", exchange: "CPH" },
  { symbol: "DANSKE.CO", name: "Danske Bank", type: "EQUITY", exchange: "CPH" },
  { symbol: "ORSTED.CO", name: "Ørsted", type: "EQUITY", exchange: "CPH" },
  { symbol: "CARL-B.CO", name: "Carlsberg", type: "EQUITY", exchange: "CPH" },
  { symbol: "DSV.CO", name: "DSV", type: "EQUITY", exchange: "CPH" },
  { symbol: "GN.CO", name: "GN Store Nord", type: "EQUITY", exchange: "CPH" },
  { symbol: "PNDORA.CO", name: "Pandora", type: "EQUITY", exchange: "CPH" },
  { symbol: "TRYG.CO", name: "Tryg", type: "EQUITY", exchange: "CPH" },
  { symbol: "NDA-DK.CO", name: "Nordea Bank", type: "EQUITY", exchange: "CPH" },
  { symbol: "COLO-B.CO", name: "Coloplast", type: "EQUITY", exchange: "CPH" },
  { symbol: "AMBU-B.CO", name: "Ambu", type: "EQUITY", exchange: "CPH" },
  { symbol: "DEMANT.CO", name: "Demant", type: "EQUITY", exchange: "CPH" },
  { symbol: "ISS.CO", name: "ISS", type: "EQUITY", exchange: "CPH" },
  { symbol: "GMAB.CO", name: "Genmab", type: "EQUITY", exchange: "CPH" },
  { symbol: "NZYM-B.CO", name: "Novonesis (Novozymes)", type: "EQUITY", exchange: "CPH" },
  { symbol: "SIM.CO", name: "SimCorp", type: "EQUITY", exchange: "CPH" },
  { symbol: "RBREW.CO", name: "Royal Unibrew", type: "EQUITY", exchange: "CPH" },
  { symbol: "BAVA.CO", name: "Bavarian Nordic", type: "EQUITY", exchange: "CPH" },
];

const HOLDING_COLORS = [
  "#d4b56a",
  "#7a9bb8",
  "#8fbf9f",
  "#c9897a",
  "#b8a1c9",
  "#8aa8a3",
  "#c4a574",
  "#6e8b9e",
  "#d1a3a0",
  "#9bb07a",
];

const usdFmt = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const localFmtCache = {};
const usdParts = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const root = document.querySelector("#app");
const headEl = document.querySelector("#app-head");
const tapeEl = document.querySelector("#app-tape");
const bodyEl = document.querySelector("#app-body");
let lastTapeHtml = null;
const cache = loadJson(CACHE_KEY);
const newsCache = loadJson(NEWS_KEY);

const state = {
  holdings: loadHoldings(),
  quotes: cache?.quotes || {},
  fx: cache?.fx || {},
  news: newsCache?.news || {},
  updatedAt: cache?.updatedAt || null,
  status: "idle",
  error: null,
  modal: null,
  settings: loadSettings(),
  searchQ: "",
  searchResults: [],
  selectedSymbol: "",
  selectedName: "",
  quantity: "1",
  costBasis: "",
  now: Date.now(),
};

let searchTimer = 0;

function loadJson(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || "null");
  } catch {
    return null;
  }
}

function saveJson(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function loadHoldings() {
  const parsed = loadJson(HOLDINGS_KEY);
  if (!Array.isArray(parsed)) return [];
  return parsed
    .filter((h) => h && typeof h.symbol === "string")
    .map((h) => ({
      id: String(h.id || crypto.randomUUID()),
      symbol: h.symbol.trim().toUpperCase(),
      name: String(h.name || h.symbol),
      quantity: Number(h.quantity) || 0,
      costBasis: h.costBasis == null ? null : Number(h.costBasis),
    }));
}

function persist() {
  saveJson(HOLDINGS_KEY, state.holdings);
}

function loadSettings() {
  const saved = loadJson(SETTINGS_KEY) || {};
  return {
    localCurrency: CURRENCY_OPTIONS.some((c) => c.code === saved.localCurrency)
      ? saved.localCurrency
      : DEFAULT_SETTINGS.localCurrency,
    timeFormat: TIME_FORMAT_OPTIONS.some((t) => t.value === saved.timeFormat)
      ? saved.timeFormat
      : DEFAULT_SETTINGS.timeFormat,
    timezone: TIMEZONE_OPTIONS.some((t) => t.value === saved.timezone)
      ? saved.timezone
      : DEFAULT_SETTINGS.timezone,
  };
}

function persistSettings() {
  saveJson(SETTINGS_KEY, state.settings);
}

function esc(value) {
  return String(value).replace(/[&<>"']/g, (ch) =>
    ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch],
  );
}

function formatUsd(n) {
  return usdFmt.format(n);
}

function formatLocal(n) {
  const code = state.settings.localCurrency;
  if (code === "USD") return formatUsd(n);
  let fmt = localFmtCache[code];
  if (!fmt) {
    fmt = new Intl.NumberFormat(CURRENCY_LOCALES[code] || "en-US", { style: "currency", currency: code });
    localFmtCache[code] = fmt;
  }
  return fmt.format(n);
}

function splitUsd(n) {
  const formatted = usdParts.format(n);
  const match = formatted.match(/^(.*)([.]\d{2})$/);
  if (!match) return { main: formatted, frac: "" };
  return { main: match[1], frac: match[2] };
}

function formatQty(n) {
  if (Number.isInteger(n)) return n.toLocaleString("en-US");
  const abs = Math.abs(n);
  const digits = abs >= 1 ? 4 : abs >= 0.01 ? 6 : 8;
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}

function formatPct(n) {
  return `${n > 0 ? "+" : ""}${n.toFixed(2)}%`;
}

function formatSignedUsd(n) {
  const sign = n > 0 ? "+" : n < 0 ? "−" : "";
  return `${sign}${usdFmt.format(Math.abs(n))}`;
}

function formatPrice(n, currency) {
  try {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency,
      maximumFractionDigits: n >= 1 ? 2 : 6,
    }).format(n);
  } catch {
    return `${n.toFixed(2)} ${currency}`;
  }
}

function dateTimeZoneOption() {
  return state.settings.timezone === "auto" ? {} : { timeZone: state.settings.timezone };
}

function formatTime(ts) {
  const opts = {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    ...dateTimeZoneOption(),
  };
  if (state.settings.timeFormat === "12") opts.hour12 = true;
  else if (state.settings.timeFormat === "24") opts.hour12 = false;
  return new Intl.DateTimeFormat(undefined, opts).format(ts);
}

function formatDate(ts) {
  return new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    ...dateTimeZoneOption(),
  }).format(ts);
}

function relativeAgo(from, now) {
  const sec = Math.max(0, Math.round((now - from) / 1000));
  if (sec < 5) return "just now";
  if (sec < 60) return `${sec}s ago`;
  return `${Math.round(sec / 60)}m ago`;
}

function formatNewsAgo(from, now) {
  const sec = Math.max(0, Math.round((now - from) / 1000));
  if (sec < 60) return "now";
  if (sec < 3600) return `${Math.floor(sec / 60)}m`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h`;
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}d`;
  return new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(from);
}

function colorFor(symbol, index) {
  if (symbol === "BTC-USD") return "#f0b429";
  if (symbol === "ETH-USD") return "#7aa2ff";
  return HOLDING_COLORS[index % HOLDING_COLORS.length];
}

function isCrypto(quote, symbol) {
  if (CRYPTO[symbol]) return true;
  if (quote?.quoteType === "CRYPTOCURRENCY") return true;
  return /-(USD|USDT)$/.test(symbol);
}

function toUsd(amount, currency, fx) {
  if (!currency || currency === "USD") return amount;
  const rate = fx[currency];
  if (!rate) return amount;
  return amount / rate;
}

function toLocal(amountUsd, fx) {
  const code = state.settings.localCurrency;
  if (code === "USD") return amountUsd;
  return amountUsd * (fx[code] || 0);
}

function signClass(n) {
  if (n > 0.0001) return "up";
  if (n < -0.0001) return "down";
  return "flat";
}

function cryptoMeta(symbol) {
  return CRYPTO[symbol] || CRYPTO[symbol.replace(/-USD$/, "")] || null;
}

async function fetchDirect(url, timeout = 8000) {
  const res = await fetch(url, { signal: AbortSignal.timeout(timeout) });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res;
}

function parseProxyPayload(text) {
  let body = text;
  const jinaMarker = "Markdown Content:\n";
  const jinaIdx = body.indexOf(jinaMarker);
  if (jinaIdx !== -1) body = body.slice(jinaIdx + jinaMarker.length);
  const trimmed = body.trim();
  if (trimmed.startsWith("{") || trimmed.startsWith("[")) {
    try {
      const json = JSON.parse(trimmed);
      if (typeof json.contents === "string") {
        const inner = json.contents.trim();
        if (inner.startsWith("{") || inner.startsWith("[")) return JSON.parse(inner);
        return inner;
      }
      return json;
    } catch {
      return trimmed;
    }
  }
  return trimmed;
}

async function tryProxy(wrap, url) {
  const res = await fetch(wrap(url), { signal: AbortSignal.timeout(7000) });
  if (!res.ok) throw new Error(`proxy HTTP ${res.status}`);
  const text = await res.text();
  if (!text || text.trim().startsWith("<!")) throw new Error("proxy returned non-JSON");
  return parseProxyPayload(text);
}

async function fetchViaProxy(url) {
  // Raced in parallel (not tried one-by-one) so a slow/dead proxy doesn't
  // block the others - public CORS relays go down or start rate-limiting
  // without notice, so we take whichever responds with valid content first.
  const proxies = [
    (u) => `https://api.allorigins.win/raw?url=${encodeURIComponent(u)}`,
    (u) => `https://api.allorigins.win/get?url=${encodeURIComponent(u)}`,
    (u) => `https://corsproxy.io/?${encodeURIComponent(u)}`,
    (u) => `https://r.jina.ai/${u}`,
  ];
  try {
    return await Promise.any(proxies.map((wrap) => tryProxy(wrap, url)));
  } catch (err) {
    throw err?.errors?.[0] || new Error("All proxies failed");
  }
}

async function fetchJsonDirect(url) {
  const res = await fetchDirect(url);
  return res.json();
}

async function fetchYahoo(pathAndQuery) {
  const url = `https://query1.finance.yahoo.com${pathAndQuery}`;
  try {
    return await (await fetchDirect(url, 4000)).json();
  } catch {
    return fetchViaProxy(url);
  }
}

function parseYahooChart(json) {
  const result = json?.chart?.result?.[0];
  const meta = result?.meta;
  if (!meta || meta.regularMarketPrice == null) return null;
  let price = Number(meta.regularMarketPrice);
  let currency = meta.currency || "USD";
  let prev = Number(meta.chartPreviousClose || meta.previousClose || price);
  if (currency === "GBp" || currency === "GBX") {
    price /= 100;
    prev /= 100;
    currency = "GBP";
  }
  const change = price - prev;
  return {
    symbol: String(meta.symbol || "").toUpperCase(),
    name: meta.shortName || meta.longName || meta.symbol,
    price,
    currency,
    change,
    changePercent: prev ? (change / prev) * 100 : 0,
    previousClose: prev,
    quoteType: meta.instrumentType || "EQUITY",
    marketState: meta.marketState || "REGULAR",
    exchange: meta.exchangeName || "",
  };
}

async function quoteCrypto(symbol) {
  const meta = cryptoMeta(symbol);
  let id = meta?.id;
  let name = meta?.name || symbol;
  if (!id) {
    const needle = symbol.replace(/-USD$/, "").toLowerCase();
    const search = await fetchJsonDirect(
      `https://api.coingecko.com/api/v3/search?query=${encodeURIComponent(needle)}`,
    );
    const coin = (search.coins || []).find(
      (c) => c.symbol?.toLowerCase() === needle || c.id === needle,
    ) || search.coins?.[0];
    if (!coin) throw new Error("Unknown crypto");
    id = coin.id;
    name = coin.name;
  }
  const data = await fetchJsonDirect(
    `https://api.coingecko.com/api/v3/simple/price?ids=${encodeURIComponent(id)}&vs_currencies=usd,dkk&include_24hr_change=true`,
  );
  const row = data[id];
  if (!row?.usd) throw new Error("No crypto price");
  const changePercent = Number(row.usd_24h_change || 0);
  const price = Number(row.usd);
  return {
    symbol,
    name,
    price,
    currency: "USD",
    change: price * (changePercent / 100) / (1 + changePercent / 100 || 1),
    changePercent,
    previousClose: price / (1 + changePercent / 100 || 1),
    quoteType: "CRYPTOCURRENCY",
    marketState: "REGULAR",
    exchange: "CCC",
    dkkPrice: row.dkk ? Number(row.dkk) : null,
  };
}

async function quoteYahoo(symbol) {
  const json = await fetchYahoo(
    `/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=5d`,
  );
  const quote = parseYahooChart(json);
  if (!quote) throw new Error("No Yahoo quote");
  return quote;
}

async function quoteBinanceBtc() {
  const data = await fetchJsonDirect("https://api.binance.com/api/v3/ticker/24hr?symbol=BTCUSDT");
  const price = Number(data.lastPrice);
  const changePercent = Number(data.priceChangePercent);
  return {
    symbol: "BTC-USD",
    name: "Bitcoin",
    price,
    currency: "USD",
    change: Number(data.priceChange),
    changePercent,
    previousClose: Number(data.prevClosePrice),
    quoteType: "CRYPTOCURRENCY",
    marketState: "REGULAR",
    exchange: "Binance",
  };
}

async function quoteSymbol(symbol) {
  if (cryptoMeta(symbol) || /-(USD|USDT)$/.test(symbol)) {
    try {
      return await quoteCrypto(symbol);
    } catch {
      if (symbol === "BTC-USD" || symbol === "BTC") return quoteBinanceBtc();
    }
  }
  return quoteYahoo(symbol);
}

async function fetchFx() {
  const fx = { USD: 1 };
  try {
    const data = await fetchJsonDirect("https://open.er-api.com/v6/latest/USD");
    if (data?.rates) {
      for (const code of ["DKK", "EUR", "GBP", "SEK", "NOK"]) {
        if (data.rates[code]) fx[code] = Number(data.rates[code]);
      }
    }
  } catch {
    try {
      const data = await fetchJsonDirect("https://api.frankfurter.dev/v1/latest?from=USD&to=DKK,EUR,GBP");
      Object.assign(fx, data.rates || {});
    } catch {
      // leave USD only
    }
  }
  return fx;
}

function dedupeResults(list) {
  const seen = new Set();
  return list.filter((r) => {
    if (seen.has(r.symbol)) return false;
    seen.add(r.symbol);
    return true;
  });
}

function localTickerMatches(query) {
  const needle = query.trim().toLowerCase();
  if (!needle) return [];
  const starts = [];
  const contains = [];
  for (const t of STOCK_DIRECTORY) {
    const sym = t.symbol.toLowerCase();
    const bareSym = sym.replace(/[.\-].*$/, "");
    if (sym.startsWith(needle) || bareSym.startsWith(needle)) starts.push(t);
    else if (t.name.toLowerCase().includes(needle)) contains.push(t);
  }
  return [...starts, ...contains];
}

function cryptoMatch(query) {
  const cryptoHit = cryptoMeta(query.toUpperCase());
  if (!cryptoHit) return null;
  const symbol =
    cryptoHit.id === "ethereum" ? "ETH-USD" : cryptoHit.id === "solana" ? "SOL-USD" : "BTC-USD";
  return { symbol, name: cryptoHit.name, type: "CRYPTOCURRENCY", exchange: "CCC" };
}

function typedFallback(query) {
  const symbol = query.trim().toUpperCase();
  return { symbol, name: symbol, type: "", exchange: "typed" };
}

// Local matches resolve instantly with no network dependency. Yahoo's search
// API sends no CORS headers, so reaching it needs a public proxy relay -
// those are flaky, so treat any live results as a nice-to-have on top.
async function liveTickerSearch(query) {
  const json = await fetchYahoo(
    `/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=8&newsCount=0`,
  );
  return (json.quotes || [])
    .filter((item) => item.symbol && item.quoteType !== "NONE")
    .map((item) => ({
      symbol: String(item.symbol).toUpperCase(),
      name: item.shortname || item.longname || item.symbol,
      type: item.quoteType || item.typeDisp || "",
      exchange: item.exchDisp || item.exchange || "",
    }));
}

function faviconFor(url) {
  try {
    const host = new URL(url).hostname;
    return `https://www.google.com/s2/favicons?domain=${encodeURIComponent(host)}&sz=128`;
  } catch {
    return "";
  }
}

function parseRss(xml) {
  const doc = new DOMParser().parseFromString(xml, "text/xml");
  return [...doc.querySelectorAll("item")].slice(0, 3).map((item, i) => {
    const title = item.querySelector("title")?.textContent || "";
    const link = item.querySelector("link")?.textContent || "";
    const sourceEl = item.querySelector("source");
    const source = sourceEl?.textContent || item.querySelector("dc\\:creator")?.textContent || "Wire";
    const sourceUrl = sourceEl?.getAttribute("url") || "";
    const pub = item.querySelector("pubDate")?.textContent;
    // Google News RSS items never carry an enclosure/media:content thumbnail,
    // so fall back to the publisher's favicon as a small logo badge.
    const thumb =
      item.querySelector("enclosure")?.getAttribute("url") ||
      item.querySelector("media\\:content")?.getAttribute("url") ||
      faviconFor(sourceUrl || link);
    return {
      id: link || `${title}-${i}`,
      title,
      publisher: source,
      link,
      publishedAt: pub ? new Date(pub).getTime() : Date.now(),
      thumbnail: thumb,
    };
  }).filter((item) => item.title && item.link);
}

// Yahoo's own finance-search endpoint (same one used for ticker search)
// returns a curated, on-topic news array with real article thumbnails.
// It's far more relevant than scraping Google News and doesn't get treated
// as abuse by the destination the way proxying Google News does.
async function newsFromYahoo(symbol, name) {
  const label = name && name !== symbol ? name : symbol;
  const json = await fetchYahoo(`/v1/finance/search?q=${encodeURIComponent(label)}&quotesCount=1&newsCount=6`);
  return (json.news || [])
    .filter((n) => n.title && n.link)
    .slice(0, 3)
    .map((n) => {
      const pics = n.thumbnail?.resolutions || [];
      return {
        id: n.uuid || n.link,
        title: n.title,
        publisher: n.publisher || "Yahoo Finance",
        link: n.link,
        publishedAt: (n.providerPublishTime || 0) * 1000,
        thumbnail: pics[pics.length - 1]?.url || faviconFor(n.link),
      };
    });
}

async function newsFromRss(symbol, name) {
  // Ticker notation (BTC-USD, NOVO-B.CO, DANSKE.CO) never appears in article
  // prose, and including it in the query badly confuses Google News' ranking
  // - it starts surfacing loosely-related months-old articles over today's
  // coverage. Search by the plain company/asset name only.
  const label = name && name !== symbol ? name : symbol;
  const query = encodeURIComponent(label);
  const rssUrl = `https://news.google.com/rss/search?q=${query}&hl=en-US&gl=US&ceid=US:en`;
  const xml = await fetchViaProxy(rssUrl);
  const text = typeof xml === "string" ? xml : xml.contents || "";
  return parseRss(text);
}

async function newsFromHn(symbol, name) {
  const label = name && name !== symbol ? name : symbol.replace(/-USD$/, "");
  const query = encodeURIComponent(isCrypto(null, symbol) ? label : `${label} stock`);
  const json = await fetchJsonDirect(
    `https://hn.algolia.com/api/v1/search_by_date?query=${query}&tags=story&hitsPerPage=8`,
  );
  // Algolia's search is fuzzy/full-text, not a strict match - a bare query
  // like "BTC" or "Bitcoin" happily returns stories that only mention the
  // term in passing (or not at all in the title). Require the title itself
  // to actually be about it before treating a hit as real coverage.
  const needle = label.toLowerCase();
  return (json.hits || [])
    .filter((hit) => hit.title && (hit.url || hit.story_url) && hit.title.toLowerCase().includes(needle))
    .slice(0, 3)
    .map((hit) => {
      const link = hit.url || `https://news.ycombinator.com/item?id=${hit.objectID}`;
      return {
        id: String(hit.objectID),
        title: hit.title,
        publisher: "HN",
        link,
        publishedAt: (hit.created_at_i || 0) * 1000,
        thumbnail: hit.url ? faviconFor(hit.url) : "",
      };
    });
}

const NEWS_MAX_AGE_MS = 14 * 24 * 60 * 60 * 1000;

// A "wire" implies current coverage - if the freshest match either source
// can find is months old, drop it rather than display it as if it were news.
function freshHeadlines(items) {
  return items.filter((item) => state.now - item.publishedAt < NEWS_MAX_AGE_MS);
}

async function newsForHolding(holding) {
  const quote = state.quotes[holding.symbol];
  const name = quote?.name || holding.name;
  try {
    const yahoo = freshHeadlines(await newsFromYahoo(holding.symbol, name));
    if (yahoo.length) return yahoo;
  } catch {
    // fall through
  }
  try {
    const rss = freshHeadlines(await newsFromRss(holding.symbol, name));
    if (rss.length) return rss;
  } catch {
    // fall through
  }
  return freshHeadlines(await newsFromHn(holding.symbol, name));
}

function holdingValueUsd(holding, quote) {
  if (!quote) return 0;
  return toUsd(quote.price * holding.quantity, quote.currency, state.fx);
}

function holdingChangeUsd(holding, quote) {
  if (!quote) return 0;
  return toUsd(quote.change * holding.quantity, quote.currency, state.fx);
}

function totals() {
  let usd = 0;
  let changeUsd = 0;
  let btcUsd = 0;
  let stocksUsd = 0;
  const rows = state.holdings.map((holding, index) => {
    const quote = state.quotes[holding.symbol];
    const valueUsd = holdingValueUsd(holding, quote);
    const dayUsd = holdingChangeUsd(holding, quote);
    usd += valueUsd;
    changeUsd += dayUsd;
    const crypto = isCrypto(quote, holding.symbol);
    if (crypto) btcUsd += valueUsd;
    else stocksUsd += valueUsd;
    const pnlUsd =
      quote && holding.costBasis != null
        ? valueUsd - toUsd(holding.costBasis * holding.quantity, quote.currency, state.fx)
        : null;
    return {
      holding,
      quote,
      valueUsd,
      dayUsd,
      crypto,
      color: colorFor(holding.symbol, index),
      pnlUsd,
      headlines: state.news[holding.symbol] || [],
    };
  });
  const changePct = usd - changeUsd === 0 ? 0 : (changeUsd / (usd - changeUsd)) * 100;
  return { usd, local: toLocal(usd, state.fx), changeUsd, changePct, btcUsd, stocksUsd, rows };
}

function wireHeadlines() {
  const seen = new Set();
  const items = [];
  for (const holding of state.holdings) {
    for (const item of state.news[holding.symbol] || []) {
      if (seen.has(item.id) || seen.has(item.link)) continue;
      seen.add(item.id);
      seen.add(item.link);
      items.push({ ...item, symbol: holding.symbol });
    }
  }
  return items.sort((a, b) => b.publishedAt - a.publishedAt);
}

function renderNewsItem(item, compact) {
  const thumb =
    !compact && item.thumbnail
      ? `<img src="${esc(item.thumbnail)}" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">`
      : "";
  return `
    <a class="news-item ${compact ? "compact" : ""}" href="${esc(item.link)}" target="_blank" rel="noopener noreferrer">
      ${thumb}
      <div>
        <div class="news-meta">${esc(item.publisher)} · ${esc(formatNewsAgo(item.publishedAt, state.now))}</div>
        <div class="news-title">${esc(item.title)}</div>
      </div>
    </a>
  `;
}

function renderTape() {
  const items = wireHeadlines();
  if (!items.length) return "";
  const sequence = items
    .map(
      (item) =>
        `<a class="tape-item" href="${esc(item.link)}" target="_blank" rel="noopener noreferrer"><b>${esc(item.symbol)}</b>${esc(item.title)}</a>`,
    )
    .join("");
  return `
    <div class="tape-wrap">
      <div class="tape-label">Wire</div>
      <div class="tape-viewport">
        <div class="tape-track">${sequence}${sequence}</div>
      </div>
    </div>
  `;
}

function renderHolding(row, allocTotal, hasCost) {
  const q = row.quote;
  const missing = !q;
  const pct = row.valueUsd / allocTotal;
  const lead = row.headlines[0];
  const rest = row.headlines.slice(1, 2);
  const localCode = state.settings.localCurrency;
  const convertedPrice =
    q && q.currency !== localCode
      ? formatLocal(toLocal(toUsd(q.price, q.currency, state.fx), state.fx))
      : null;
  return `
    <article class="holding" data-holding="${esc(row.holding.id)}" data-dir="${signClass(row.dayUsd)}">
      <button type="button" class="holding-main" data-action="edit" data-id="${esc(row.holding.id)}">
        <div class="holding-ident">
          <span class="swatch" style="background:${row.color}"></span>
          <div>
            <div class="sym">${esc(row.holding.symbol)}</div>
            <div class="name">${esc(q?.name || row.holding.name)}${missing ? " · waiting" : ""}</div>
          </div>
        </div>
        <div class="holding-metrics">
          <div>
            <div class="metric-label">Qty</div>
            <div class="num">${esc(formatQty(row.holding.quantity))}</div>
          </div>
          <div>
            <div class="metric-label">Price</div>
            <div class="num">${q ? esc(formatPrice(q.price, q.currency)) : "—"}</div>
            ${convertedPrice ? `<div class="name">${esc(convertedPrice)}</div>` : ""}
          </div>
          <div>
            <div class="metric-label">USD / ${esc(localCode)}</div>
            <div class="num">${esc(formatUsd(row.valueUsd))}</div>
            ${localCode !== "USD" ? `<div class="name">${esc(formatLocal(toLocal(row.valueUsd, state.fx)))}</div>` : ""}
          </div>
          <div>
            <div class="metric-label">Today · ${(pct * 100).toFixed(1)}%</div>
            <div>${q ? `<span class="pill ${signClass(row.dayUsd)}">${esc(formatPct(q.changePercent))}</span>` : "—"}</div>
            ${
              hasCost
                ? `<div class="name ${row.pnlUsd == null ? "" : signClass(row.pnlUsd)}">${
                    row.pnlUsd == null ? "—" : esc(formatSignedUsd(row.pnlUsd))
                  }</div>`
                : ""
            }
          </div>
        </div>
      </button>
      <div class="holding-news">
        <div class="news-kicker">${row.crypto ? "Crypto wire" : "Company wire"}</div>
        ${
          lead
            ? `${renderNewsItem(lead, false)}${rest.map((item) => renderNewsItem(item, true)).join("")}`
            : `<div class="news-empty">Listening for headlines…</div>`
        }
      </div>
    </article>
  `;
}

function renderModal() {
  if (!state.modal) return "";
  if (state.modal.kind === "settings") return renderSettingsModal();
  return renderHoldingModal();
}

function renderSettingsModal() {
  const s = state.settings;
  const option = (opt, current) =>
    `<option value="${esc(opt.value)}" ${opt.value === current ? "selected" : ""}>${esc(opt.label)}</option>`;
  return `
    <div class="dialog-backdrop">
      <div class="dialog">
        <h3>Settings</h3>
        <p>Stored on this device only.</p>
        <div class="field">
          <label>Local currency</label>
          <select data-field="localCurrency">
            ${CURRENCY_OPTIONS.map((c) => `<option value="${esc(c.code)}" ${c.code === s.localCurrency ? "selected" : ""}>${esc(c.code)} — ${esc(c.label)}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label>Clock format</label>
          <select data-field="timeFormat">
            ${TIME_FORMAT_OPTIONS.map((o) => option(o, s.timeFormat)).join("")}
          </select>
        </div>
        <div class="field">
          <label>Timezone</label>
          <select data-field="timezone">
            ${TIMEZONE_OPTIONS.map((o) => option(o, s.timezone)).join("")}
          </select>
        </div>
        <div class="dialog-actions">
          <button type="button" class="btn btn-primary" data-action="close">Done</button>
        </div>
      </div>
    </div>
  `;
}

function renderHoldingModal() {
  const editing = state.modal.kind === "edit";
  const current =
    editing ? state.holdings.find((h) => h.id === state.modal.id) : null;
  return `
    <div class="dialog-backdrop">
      <form class="dialog" data-action="${editing ? "save-edit" : "save-add"}">
        <h3>${editing ? "Edit holding" : "Add holding"}</h3>
        <p>${editing ? "Update quantity or average cost." : "Type a ticker, then how many you hold. Saved in this browser."}</p>
        ${
          editing
            ? `<div class="field"><label>Symbol</label><input value="${esc(current?.symbol || "")}" disabled></div>`
            : `<div class="field">
                <label>Search ticker</label>
                <input data-field="search" value="${esc(state.searchQ)}" placeholder="AAPL, BTC-USD, NOVO-B.CO" autocomplete="off">
              </div>
              ${
                state.searchResults.length
                  ? `<ul class="search-list">${state.searchResults
                      .map(
                        (r) => `<li><button type="button" data-action="pick" data-symbol="${esc(r.symbol)}" data-name="${esc(r.name)}" class="${r.symbol === state.selectedSymbol ? "active" : ""}">
                          <span><strong>${esc(r.symbol)}</strong><div class="search-meta">${esc(r.name)}</div></span>
                          <span class="search-meta">${esc(r.exchange || r.type)}</span>
                        </button></li>`,
                      )
                      .join("")}</ul>`
                  : ""
              }`
        }
        ${
          state.selectedSymbol || current
            ? `<div class="field"><label>Selected</label>
                <input value="${esc(state.selectedSymbol || current?.symbol || "")} · ${esc(state.selectedName || current?.name || "")}" disabled></div>`
            : ""
        }
        <div class="field">
          <label>Quantity</label>
          <input data-field="quantity" value="${esc(state.quantity)}" inputmode="decimal">
        </div>
        <div class="field">
          <label>Avg cost (optional, native currency)</label>
          <input data-field="cost" value="${esc(state.costBasis)}" inputmode="decimal" placeholder="Leave blank to skip P/L">
        </div>
        <div class="dialog-actions">
          ${editing ? `<button type="button" class="btn btn-danger" data-action="remove">Remove</button>` : ""}
          <button type="button" class="btn btn-ghost" data-action="close">Cancel</button>
          <button type="submit" class="btn btn-primary">${editing ? "Save" : "Add"}</button>
        </div>
      </form>
    </div>
  `;
}

// The tape's CSS marquee animation restarts whenever its DOM node is
// recreated. render() runs every 30s (quote refresh) even though headlines
// only change every 5min, so it lives in its own container and is only
// touched when the rendered headlines actually differ from last time.
function updateTape() {
  const html = renderTape();
  if (html === lastTapeHtml) return;
  lastTapeHtml = html;
  tapeEl.innerHTML = html;
}

function render() {
  const t = totals();
  const usdSplit = splitUsd(t.usd);
  const hasCost = state.holdings.some((h) => h.costBasis != null);
  const allocTotal = t.usd || 1;
  headEl.innerHTML = `
    <header class="masthead">
      <div class="brand">
        <div class="logo"><span class="mark">D</span> DashEmAll</div>
        <div class="tagline">Live ledger · stocks, bitcoin, newswire</div>
      </div>
      <div class="meta">
        <button type="button" class="btn btn-ghost btn-settings" data-action="settings">Settings</button>
        <div class="status-line">
          <span class="dot ${state.status}"></span>
          ${state.status === "live" ? "Live" : state.status === "loading" ? "Updating" : state.status === "error" ? "Offline" : "Idle"}
          ${state.updatedAt ? `· ${esc(relativeAgo(state.updatedAt, state.now))}` : ""}
        </div>
        <div class="clock">${esc(formatTime(state.now))}</div>
        <div class="date">${esc(formatDate(state.now))}</div>
      </div>
    </header>
    ${state.error ? `<div class="error-banner">${esc(state.error)}</div>` : ""}
    <section class="hero">
      <div class="hero-main">
        <div class="kicker">Total value</div>
        <div class="total-usd">${esc(usdSplit.main)}<span class="frac">${esc(usdSplit.frac)}</span></div>
        ${state.settings.localCurrency !== "USD" ? `<div class="total-local">${esc(formatLocal(t.local))}</div>` : ""}
        <div class="delta ${signClass(t.changeUsd)}">
          <span>${esc(formatSignedUsd(t.changeUsd))} today</span>
          <span>${esc(formatPct(t.changePct))}</span>
          ${
            state.settings.localCurrency !== "USD"
              ? `<span class="fx-note">${
                  state.fx[state.settings.localCurrency]
                    ? `USD/${esc(state.settings.localCurrency)} ${state.fx[state.settings.localCurrency].toFixed(4)}`
                    : "Waiting for FX rate"
                }</span>`
              : ""
          }
        </div>
      </div>
      <div class="side-stats">
        <div class="stat">
          <div class="stat-label">Bitcoin &amp; crypto</div>
          <div class="stat-value">${esc(formatUsd(t.btcUsd))}</div>
          <div class="stat-sub">${
            t.rows.some((r) => r.crypto)
              ? `${t.rows.filter((r) => r.crypto).length} positions${
                  state.settings.localCurrency !== "USD"
                    ? ` · ${esc(formatLocal(toLocal(t.btcUsd, state.fx)))}`
                    : ""
                }`
              : "No crypto yet"
          }</div>
        </div>
        <div class="stat">
          <div class="stat-label">Stocks</div>
          <div class="stat-value">${esc(formatUsd(t.stocksUsd))}</div>
          <div class="stat-sub">${t.rows.filter((r) => !r.crypto).length} positions${
            state.settings.localCurrency !== "USD"
              ? ` · ${esc(formatLocal(toLocal(t.stocksUsd, state.fx)))}`
              : ""
          }</div>
        </div>
      </div>
    </section>
  `;
  updateTape();
  bodyEl.innerHTML = `
    <section class="panel">
      <div class="panel-head">
        <h2>Holdings</h2>
        <div class="actions">
          <button class="btn btn-ghost" data-action="refresh">Refresh</button>
          <button class="btn btn-primary" data-action="add">Add holding</button>
        </div>
      </div>
      ${
        state.holdings.length
          ? `<div class="alloc-row" aria-hidden="true"><div class="allocation">${t.rows
              .filter((r) => r.valueUsd > 0)
              .map((r) => `<span style="width:${((r.valueUsd / allocTotal) * 100).toFixed(3)}%;background:${r.color}"></span>`)
              .join("")}</div></div>`
          : ""
      }
      ${
        state.holdings.length === 0
          ? `<div class="empty">
              <h3>Your ledger is empty</h3>
              <p>Add bitcoin and stock tickers. Quantities stay in local storage on this machine.</p>
              <div class="chips">
                ${QUICK_ADDS.map(
                  (q) =>
                    `<button class="chip" data-action="quick" data-symbol="${esc(q.symbol)}" data-name="${esc(q.label)}">${esc(q.label)}</button>`,
                ).join("")}
              </div>
            </div>`
          : `<div class="holdings">${t.rows.map((row) => renderHolding(row, allocTotal, hasCost)).join("")}</div>`
      }
    </section>
    ${renderModal()}
  `;
}

function focusField(name) {
  queueMicrotask(() => {
    const el = root.querySelector(`[data-field="${name}"]`);
    el?.focus();
    el?.select();
  });
}

function parseQty(raw) {
  const n = Number(String(raw).replace(",", "."));
  return Number.isFinite(n) && n >= 0 ? n : NaN;
}

function openAdd(prefill) {
  state.modal = { kind: "add" };
  state.searchQ = prefill?.symbol || "";
  state.searchResults = [];
  state.selectedSymbol = prefill?.symbol || "";
  state.selectedName = prefill?.name || "";
  state.quantity = "1";
  state.costBasis = "";
  render();
  focusField(prefill ? "quantity" : "search");
}

function openEdit(id) {
  const holding = state.holdings.find((h) => h.id === id);
  if (!holding) return;
  state.modal = { kind: "edit", id };
  state.selectedSymbol = holding.symbol;
  state.selectedName = holding.name;
  state.quantity = String(holding.quantity);
  state.costBasis = holding.costBasis == null ? "" : String(holding.costBasis);
  render();
  focusField("quantity");
}

function openSettings() {
  state.modal = { kind: "settings" };
  render();
}

function closeModal() {
  state.modal = null;
  state.searchResults = [];
  render();
}

async function refreshQuotes() {
  if (!state.modal) {
    state.status = "loading";
    render();
  }
  try {
    const fx = await fetchFx();
    state.fx = fx;
    const symbols = [...new Set(state.holdings.map((h) => h.symbol))];
    const quotes = { ...state.quotes };
    await Promise.all(
      symbols.map(async (symbol) => {
        try {
          quotes[symbol] = await quoteSymbol(symbol);
        } catch {
          // keep last cached quote
        }
      }),
    );
    state.quotes = quotes;
    state.updatedAt = Date.now();
    state.status = "live";
    state.error = null;
    saveJson(CACHE_KEY, { quotes: state.quotes, fx: state.fx, updatedAt: state.updatedAt });
    for (const holding of state.holdings) {
      const q = quotes[holding.symbol];
      if (q) holding.name = q.name;
    }
    persist();
  } catch (err) {
    state.status = "error";
    state.error = err.message || "Could not refresh prices";
  }
  // Skip the repaint while a dialog is open - a full render replaces the
  // DOM wholesale and steals focus from whatever field the user is typing in.
  if (!state.modal) render();
}

async function refreshNews() {
  const next = { ...state.news };
  await Promise.all(
    state.holdings.map(async (holding) => {
      try {
        next[holding.symbol] = await newsForHolding(holding);
      } catch {
        // keep last
      }
    }),
  );
  state.news = next;
  saveJson(NEWS_KEY, { news: state.news, updatedAt: Date.now() });
  if (!state.modal) render();
}

let searchToken = 0;

function refocusSearchInput() {
  const input = root.querySelector('[data-field="search"]');
  if (input) {
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

function applySearchResults(results) {
  state.searchResults = results;
  if (results.length && !state.selectedSymbol) {
    state.selectedSymbol = results[0].symbol;
    state.selectedName = results[0].name;
  }
}

async function runSearch(q) {
  const query = q.trim();
  const token = ++searchToken;
  if (!query) {
    state.searchResults = [];
    render();
    return;
  }
  // Show local/typed matches immediately - never leaves the dropdown empty
  // while we wait on a network round trip that may never come back.
  const cryptoHit = cryptoMatch(query);
  const local = [...(cryptoHit ? [cryptoHit] : []), ...localTickerMatches(query)];
  applySearchResults(dedupeResults([...local, typedFallback(query)]));
  render();
  refocusSearchInput();
  try {
    const live = await liveTickerSearch(query);
    if (token !== searchToken) return;
    applySearchResults(dedupeResults([...local, ...live, typedFallback(query)]));
  } catch {
    // Live search is best-effort only; local + typed fallback already shown.
  }
  if (token === searchToken) {
    render();
    refocusSearchInput();
  }
}

function addHolding() {
  const symbol = (state.selectedSymbol || state.searchQ).trim().toUpperCase();
  const qty = parseQty(state.quantity);
  if (!symbol || Number.isNaN(qty) || qty === 0) return;
  const existing = state.holdings.find((h) => h.symbol === symbol);
  const cost = state.costBasis.trim() === "" ? null : parseQty(state.costBasis);
  if (existing) {
    existing.quantity += qty;
    if (cost != null && !Number.isNaN(cost)) existing.costBasis = cost;
  } else {
    state.holdings.push({
      id: crypto.randomUUID(),
      symbol,
      name: state.selectedName || symbol,
      quantity: qty,
      costBasis: cost != null && !Number.isNaN(cost) ? cost : null,
    });
  }
  persist();
  closeModal();
  refreshQuotes();
  refreshNews();
}

function saveEdit() {
  if (!state.modal || state.modal.kind !== "edit") return;
  const holding = state.holdings.find((h) => h.id === state.modal.id);
  if (!holding) return;
  const qty = parseQty(state.quantity);
  if (Number.isNaN(qty) || qty === 0) return;
  holding.quantity = qty;
  const cost = state.costBasis.trim() === "" ? null : parseQty(state.costBasis);
  holding.costBasis = cost != null && !Number.isNaN(cost) ? cost : null;
  persist();
  closeModal();
}

function removeCurrent() {
  if (!state.modal || state.modal.kind !== "edit") return;
  state.holdings = state.holdings.filter((h) => h.id !== state.modal.id);
  persist();
  closeModal();
}

root.addEventListener("click", (event) => {
  const target = event.target;
  if (target.closest("a")) return;
  if (target.closest(".dialog")) {
    const actionEl = target.closest("button[data-action]");
    if (!actionEl) return;
    event.preventDefault();
    const action = actionEl.dataset.action;
    if (action === "close") closeModal();
    if (action === "remove") removeCurrent();
    if (action === "pick") {
      state.selectedSymbol = actionEl.dataset.symbol || "";
      state.selectedName = actionEl.dataset.name || "";
      state.searchQ = state.selectedSymbol;
      render();
      focusField("quantity");
    }
    return;
  }
  if (target.closest(".dialog-backdrop")) {
    closeModal();
    return;
  }
  const actionEl = target.closest("[data-action]");
  if (!actionEl) return;
  event.preventDefault();
  const action = actionEl.dataset.action;
  if (action === "add") openAdd();
  if (action === "settings") openSettings();
  if (action === "refresh") {
    refreshQuotes();
    refreshNews();
  }
  if (action === "edit" && actionEl.dataset.id) openEdit(actionEl.dataset.id);
  if (action === "quick") {
    openAdd({ symbol: actionEl.dataset.symbol || "", name: actionEl.dataset.name || "" });
  }
});

root.addEventListener("submit", (event) => {
  event.preventDefault();
  const action = event.target.getAttribute("data-action");
  if (action === "save-add") addHolding();
  if (action === "save-edit") saveEdit();
});

root.addEventListener("input", (event) => {
  const field = event.target.dataset.field;
  if (field === "quantity") state.quantity = event.target.value;
  if (field === "cost") state.costBasis = event.target.value;
  if (field === "search") {
    state.searchQ = event.target.value;
    clearTimeout(searchTimer);
    searchTimer = setTimeout(() => runSearch(event.target.value), 250);
  }
});

root.addEventListener("change", (event) => {
  const field = event.target.dataset.field;
  if (field !== "localCurrency" && field !== "timeFormat" && field !== "timezone") return;
  state.settings[field] = event.target.value;
  persistSettings();
  render();
});

document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && state.modal) {
    closeModal();
    return;
  }
  if (event.target instanceof HTMLInputElement) return;
  if (event.key === "a") openAdd();
  if (event.key === "r") {
    refreshQuotes();
    refreshNews();
  }
});

setInterval(() => {
  state.now = Date.now();
  const clock = root.querySelector(".clock");
  const date = root.querySelector(".date");
  const live = root.querySelector(".status-line");
  if (clock) clock.textContent = formatTime(state.now);
  if (date) date.textContent = formatDate(state.now);
  if (live && state.updatedAt) {
    const status =
      state.status === "live"
        ? "Live"
        : state.status === "loading"
          ? "Updating"
          : state.status === "error"
            ? "Offline"
            : "Idle";
    live.innerHTML = `<span class="dot ${state.status}"></span>${status} · ${esc(relativeAgo(state.updatedAt, state.now))}`;
  }
}, 1000);

render();
refreshQuotes();
refreshNews();
setInterval(refreshQuotes, REFRESH_MS);
setInterval(refreshNews, NEWS_MS);
