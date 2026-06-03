import { useEffect, useMemo, useState } from "react";
import { useRecentTrades } from "../../hooks/useApi.js";
import { Trade } from "../../types/index.js";

interface TradingViewChartProps {
  accountId: string;
  theme: "dark" | "light";
  params: URLSearchParams;
}

function TradingViewChart({ accountId, theme, params }: TradingViewChartProps) {
  const { data: tradesResponse, isLoading } = useRecentTrades(accountId, 20);
  const [selectedSymbol, setSelectedSymbol] = useState("FX:EURUSD");

  const chartSymbols = useMemo(() => {
    const trades = tradesResponse?.data?.trades || [];
    const uniqueSymbols = Array.from(
      new Set(
        trades
          .filter((trade: Trade) => trade.symbol && trade.status !== "REJECTED")
          .sort((left: Trade, right: Trade) => {
            if (left.status === right.status) return 0;
            return left.status === "OPEN" ? -1 : 1;
          })
          .map((trade: Trade) => toTradingViewSymbol(trade.symbol)),
      ),
    );

    return uniqueSymbols.length > 0 ? uniqueSymbols : ["FX:EURUSD"];
  }, [tradesResponse?.data?.trades]);

  useEffect(() => {
    if (!chartSymbols.includes(selectedSymbol)) {
      setSelectedSymbol(chartSymbols[0]);
    }
  }, [chartSymbols, selectedSymbol]);

  return (
    <section className="tradingview-panel">
      <iframe
        title="TradingView advanced chart"
        src={`https://s.tradingview.com/widgetembed/?${params.toString()}`}
        className="tradingview-frame"
        allowFullScreen
      />
    </section>
  );
}

const toTradingViewSymbol = (symbol: string) => {
  const normalizedSymbol = symbol.replace(/[^A-Z0-9]/gi, "").toUpperCase();

  if (["BTCUSDT", "ETHUSDT", "SOLUSDT", "BNBUSDT"].includes(normalizedSymbol)) {
    return `BINANCE:${normalizedSymbol}`;
  }

  if (["XAUUSD", "XAGUSD"].includes(normalizedSymbol)) {
    return `OANDA:${normalizedSymbol}`;
  }

  if (/^[A-Z]{6}$/.test(normalizedSymbol)) {
    return `FX:${normalizedSymbol}`;
  }

  return normalizedSymbol;
};

export default TradingViewChart;
