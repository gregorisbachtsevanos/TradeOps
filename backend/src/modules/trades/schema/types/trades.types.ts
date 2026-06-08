export interface ITradeIntent {
  symbol: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  quantity: number;
  stopLoss?: number;
  takeProfit?: number;
  strategyId: string;
  signalId: string;
}

export interface ITradeExecutionResult {
  success: boolean;
  tradeId?: string;
  externalTradeId?: string;
  error?: string;
  details?: Record<string, unknown>;
}
