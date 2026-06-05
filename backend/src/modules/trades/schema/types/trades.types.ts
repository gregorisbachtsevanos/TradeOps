export interface TradeIntent {
  symbol: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  strategyId: string;
  signalId: string;
}

export interface TradeExecutionResult {
  success: boolean;
  tradeId?: string;
  externalTradeId?: string;
  error?: string;
  details?: Record<string, unknown>;
}
