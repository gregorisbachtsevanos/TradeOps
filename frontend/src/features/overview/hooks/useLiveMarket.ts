import { useEffect, useMemo, useState } from "react";

export interface LiveMarketSnapshot {
  symbol: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  direction: "up" | "down";
  timestamp: string;
}

interface LiveMarketState {
  connectionState: "connected" | "connecting" | "disconnected";
  transport: "simulated-websocket";
  ticks: LiveMarketSnapshot[];
}

const basePrices: Record<string, number> = {
  EURUSD: 1.0835,
  GBPUSD: 1.268,
  USDJPY: 156.75,
  XAUUSD: 2350.4,
  BTCUSDT: 68250,
  ETHUSDT: 3750,
};

export const useLiveMarket = (symbols: string[]): LiveMarketState => {
  const normalizedSymbols = useMemo(
    () => symbols.map(normalizeSymbol).filter(Boolean),
    [symbols],
  );
  const [connectionState, setConnectionState] =
    useState<LiveMarketState["connectionState"]>("connecting");
  const [ticks, setTicks] = useState<LiveMarketSnapshot[]>(() =>
    createSnapshots(normalizedSymbols),
  );

  useEffect(() => {
    setConnectionState("connecting");
    const connectTimer = window.setTimeout(() => {
      setConnectionState("connected");
    }, 450);

    return () => window.clearTimeout(connectTimer);
  }, [normalizedSymbols.join("|")]);

  useEffect(() => {
    setTicks(createSnapshots(normalizedSymbols));

    const interval = window.setInterval(() => {
      setTicks((currentTicks) =>
        currentTicks.map((tick) => {
          const volatility = tick.symbol.includes("BTC")
            ? 45
            : tick.symbol.includes("XAU")
              ? 1.8
              : 0.0016;
          const move = (Math.random() - 0.48) * volatility;
          const bid = Math.max(tick.bid + move, 0.0001);
          const ask = bid + tick.spread;

          return {
            ...tick,
            bid,
            ask,
            change: tick.change + move,
            direction: move >= 0 ? "up" : "down",
            timestamp: new Date().toISOString(),
          };
        }),
      );
    }, 1450);

    return () => window.clearInterval(interval);
  }, [normalizedSymbols.join("|")]);

  return {
    connectionState,
    transport: "simulated-websocket",
    ticks,
  };
};

export const normalizeSymbol = (symbol: string) =>
  symbol.replace(/^[A-Z]+:/, "").replace(/[^A-Z0-9]/gi, "").toUpperCase();

const createSnapshots = (symbols: string[]) =>
  (symbols.length > 0 ? symbols : ["EURUSD", "GBPUSD", "XAUUSD"]).map(
    (symbol) => {
      const basePrice = basePrices[symbol] ?? 100 + Math.random() * 20;
      const spread = symbol.includes("BTC")
        ? 8
        : symbol.includes("XAU")
          ? 0.35
          : 0.0002;

      return {
        symbol,
        bid: basePrice,
        ask: basePrice + spread,
        spread,
        change: 0,
        direction: "up" as const,
        timestamp: new Date().toISOString(),
      };
    },
  );
