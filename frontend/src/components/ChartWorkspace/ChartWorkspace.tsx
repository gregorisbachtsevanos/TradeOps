import { useEffect, useMemo, useState } from "react";
import { useRecentTrades } from "../../hooks/useApi.js";
import { normalizeSymbol, useLiveMarket } from "../../hooks/useLiveMarket.js";
import { Trade } from "../../types/index.js";
import TradingViewChart from "../TradingViewChart/TradingViewChart.js";

interface ChartWorkspaceProps {
  accountId: string;
  theme: "dark" | "light";
}

function ChartWorkspace({ accountId, theme }: ChartWorkspaceProps) {
  const { data: tradesResponse } = useRecentTrades(accountId, 20);
  const trades = tradesResponse?.data?.trades || [];
  const symbols = useMemo(() => deriveSymbols(trades), [trades]);
  const [selectedSymbol, setSelectedSymbol] = useState(symbols[0]);
  const [orderSide, setOrderSide] = useState<"BUY" | "SELL">("BUY");
  const [volume, setVolume] = useState("0.10");
  const { connectionState, transport, ticks } = useLiveMarket(symbols);

  useEffect(() => {
    if (!symbols.includes(selectedSymbol)) {
      setSelectedSymbol(symbols[0]);
    }
  }, [selectedSymbol, symbols]);

  const selectedTick =
    ticks.find((tick) => tick.symbol === selectedSymbol) || ticks[0];
  const selectedChartSymbol = toTradingViewSymbol(selectedSymbol);
  const params = new URLSearchParams({
    symbol: selectedChartSymbol,
    interval: "60",
    theme,
    style: "1",
    timezone: "Etc/UTC",
    withdateranges: "1",
    hide_side_toolbar: "0",
    allow_symbol_change: "1",
    save_image: "0",
    studies: "MACD@tv-basicstudies,RSI@tv-basicstudies",
  });

  const activityFeed = [
    `${selectedSymbol} tick ${selectedTick?.direction === "up" ? "up" : "down"} to ${formatPrice(
      selectedTick?.bid,
    )}`,
    `Risk engine synced exposure for ${accountId.slice(-6)}`,
    `${transport} heartbeat ${connectionState}`,
    trades[0]
      ? `${trades[0].direction} ${trades[0].symbol} position monitored`
      : "Awaiting first strategy signal",
  ];

  return (
    <section className="chart-workspace">
      <div className="workspace-main">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Professional chart workspace</p>
            <h3>{selectedSymbol}</h3>
          </div>
          <div className="chart-actions">
            <span className={`live-pill ${connectionState}`}>
              <span className="status-dot" />
              {connectionState}
            </span>
            <select
              value={selectedSymbol}
              onChange={(event) => setSelectedSymbol(event.target.value)}
            >
              {symbols.map((symbol) => (
                <option key={symbol} value={symbol}>
                  {symbol}
                </option>
              ))}
            </select>
            <span className="chart-badge">TradingView</span>
          </div>
        </div>
        <TradingViewChart accountId={accountId} theme={theme} />

        {/* <iframe
          title="TradingView advanced chart"
          src={`https://s.tradingview.com/widgetembed/?${params.toString()}`}
          className="tradingview-frame"
          allowFullScreen
        /> */}
      </div>

      {/* <aside className="workspace-side">
        <div className="workspace-card watchlist">
          <div className="workspace-card-header">
            <span>Watchlist</span>
            <small>Live ticks</small>
          </div>
          {ticks.map((tick) => (
            <button
              key={tick.symbol}
              className={`watchlist-row ${tick.symbol === selectedSymbol ? "active" : ""}`}
              onClick={() => setSelectedSymbol(tick.symbol)}
            >
              <strong>{tick.symbol}</strong>
              <span
                className={
                  tick.direction === "up" ? "positive flash" : "negative flash"
                }
              >
                {formatPrice(tick.bid)}
              </span>
              <small>{formatSigned(tick.change)}</small>
            </button>
          ))}
        </div>

        <div className="workspace-card order-ticket">
          <div className="workspace-card-header">
            <span>Order Ticket</span>
            <small>Simulation</small>
          </div>
          <div className="order-toggle">
            <button
              className={orderSide === "BUY" ? "active buy" : ""}
              onClick={() => setOrderSide("BUY")}
            >
              Buy
            </button>
            <button
              className={orderSide === "SELL" ? "active sell" : ""}
              onClick={() => setOrderSide("SELL")}
            >
              Sell
            </button>
          </div>
          <label>
            Volume
            <input
              value={volume}
              onChange={(event) => setVolume(event.target.value)}
            />
          </label>
          <div className="quote-grid">
            <span>Bid</span>
            <strong>{formatPrice(selectedTick?.bid)}</strong>
            <span>Ask</span>
            <strong>{formatPrice(selectedTick?.ask)}</strong>
          </div>
          <button className={`place-order ${orderSide.toLowerCase()}`}>
            Place {orderSide} Demo Order
          </button>
        </div>
      </aside> */}

      {/* <div className="workspace-bottom">
        <div className="workspace-card positions-mini">
          <div className="workspace-card-header">
            <span>Positions</span>
            <small>{trades.length} recent</small>
          </div>
          {trades.slice(0, 4).map((trade) => (
            <div className="position-row" key={trade.id}>
              <strong>{trade.symbol}</strong>
              <span
                className={trade.direction === "BUY" ? "positive" : "negative"}
              >
                {trade.direction}
              </span>
              <small>{trade.status}</small>
            </div>
          ))}
        </div>

        <div className="workspace-card activity-feed">
          <div className="workspace-card-header">
            <span>Activity Feed</span>
            <small>Realtime ready</small>
          </div>
          {activityFeed.map((item, index) => (
            <div className="feed-row" key={`${item}-${index}`}>
              <span className="feed-dot" />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div> */}
    </section>
  );
}

const deriveSymbols = (trades: Trade[]) => {
  const symbols = Array.from(
    new Set(
      trades
        .filter((trade) => trade.symbol && trade.status !== "REJECTED")
        .sort((left, right) => {
          if (left.status === right.status) return 0;
          return left.status === "OPEN" ? -1 : 1;
        })
        .map((trade) => normalizeSymbol(trade.symbol)),
    ),
  );

  return symbols.length > 0 ? symbols : ["EURUSD", "GBPUSD", "XAUUSD"];
};

const toTradingViewSymbol = (symbol: string) => {
  if (["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"].includes(symbol)) {
    return `BINANCE:${symbol}`;
  }

  if (["XAUUSD", "XAGUSD"].includes(symbol)) {
    return `OANDA:${symbol}`;
  }

  if (/^[A-Z]{6}$/.test(symbol)) {
    return `FX:${symbol}`;
  }

  return symbol;
};

const formatPrice = (value?: number) =>
  typeof value === "number"
    ? value.toLocaleString(undefined, {
        minimumFractionDigits: value > 10 ? 2 : 5,
        maximumFractionDigits: value > 10 ? 2 : 5,
      })
    : "--";

const formatSigned = (value: number) =>
  `${value >= 0 ? "+" : ""}${value.toFixed(Math.abs(value) > 1 ? 2 : 5)}`;

export default ChartWorkspace;
