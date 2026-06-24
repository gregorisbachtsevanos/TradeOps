import { useEffect, useMemo, useState } from "react";
import { useRecentTrades } from "../../analytics/hooks/useAnalytics.js";
import { normalizeSymbol, useLiveMarket } from "../hooks/useLiveMarket.js";
import TradingViewChart from "./TradingViewChart.js";
import { IChartWorkspaceProps, ITrade } from "../types/overview.types.js";
import styles from "../../Dashboard/view/Dashboard.module.scss";

const ChartWorkspace = ({ accountId, theme }: IChartWorkspaceProps) => {
  const { data: trades } = useRecentTrades(accountId, 20);
  const symbols = useMemo(() => deriveSymbols(trades || []), [trades]);
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
    trades?.[0]
      ? `${trades[0].direction} ${trades[0].symbol} position monitored`
      : "Awaiting first strategy signal",
  ];

  return (
    <section className={styles["chart-workspace"]}>
      <div className={styles["workspace-main"]}>
        <div className={styles["panel-header"]}>
          <div>
            <p className={styles.eyebrow}>Professional chart workspace</p>
            <h3>{selectedSymbol}</h3>
          </div>
          <div className={styles["chart-actions"]}>
            <span className={`${styles["live-pill"]} ${styles[connectionState]}`}>
              <span className={styles["status-dot"]} />
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
            <span className={styles["chart-badge"]}>TradingView</span>
          </div>
        </div>
        <TradingViewChart params={params} />
      </div>

      <aside className={styles["workspace-side"]}>
        <div className={`${styles["workspace-card"]} ${styles.watchlist}`}>
          <div className={styles["workspace-card-header"]}>
            <span>Watchlist</span>
            <small>Live ticks</small>
          </div>
          {ticks.map((tick) => (
            <button
              key={tick.symbol}
              className={`${styles["watchlist-row"]} ${tick.symbol === selectedSymbol ? styles.active : ""}`}
              onClick={() => setSelectedSymbol(tick.symbol)}
            >
              <strong>{tick.symbol}</strong>
              <span
                className={
                  tick.direction === "up"
                    ? `${styles.positive} ${styles.flash}`
                    : `${styles.negative} ${styles.flash}`
                }
              >
                {formatPrice(tick.bid)}
              </span>
              <small>{formatSigned(tick.change)}</small>
            </button>
          ))}
        </div>

        <div className={`${styles["workspace-card"]} ${styles["order-ticket"]}`}>
          <div className={styles["workspace-card-header"]}>
            <span>Order Ticket</span>
            <small>Simulation</small>
          </div>
          <div className={styles["order-toggle"]}>
            <button
              className={orderSide === "BUY" ? `${styles.active} ${styles.buy}` : ""}
              onClick={() => setOrderSide("BUY")}
            >
              Buy
            </button>
            <button
              className={orderSide === "SELL" ? `${styles.active} ${styles.sell}` : ""}
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
          <div className={styles["quote-grid"]}>
            <span>Bid</span>
            <strong>{formatPrice(selectedTick?.bid)}</strong>
            <span>Ask</span>
            <strong>{formatPrice(selectedTick?.ask)}</strong>
          </div>
          <button className={`${styles["place-order"]} ${styles[orderSide.toLowerCase()]}`}>
            Place {orderSide} Demo Order
          </button>
        </div>
      </aside>

      <div className={styles["workspace-bottom"]}>
        <div className={`${styles["workspace-card"]} ${styles["positions-mini"]}`}>
          <div className={styles["workspace-card-header"]}>
            <span>Positions</span>
            <small>{trades?.length || 0} recent</small>
          </div>
          {(trades || []).slice(0, 4).map((trade) => (
            <div className={styles["position-row"]} key={trade.id}>
              <strong>{trade.symbol}</strong>
              <span
                className={trade.direction === "BUY" ? styles.positive : styles.negative}
              >
                {trade.direction}
              </span>
              <small>{trade.status}</small>
            </div>
          ))}
        </div>

        <div className={`${styles["workspace-card"]} ${styles["activity-feed"]}`}>
          <div className={styles["workspace-card-header"]}>
            <span>Activity Feed</span>
            <small>Realtime ready</small>
          </div>
          {activityFeed.map((item, index) => (
            <div className={styles["feed-row"]} key={`${item}-${index}`}>
              <span className={styles["feed-dot"]} />
              <p>{item}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

const deriveSymbols = (trades: ITrade[]) => {
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
