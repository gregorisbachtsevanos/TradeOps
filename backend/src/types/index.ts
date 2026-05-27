// Type definitions for the Trading Automation Platform

export interface TradingViewWebhookPayload {
  passphrase: string;
  time: string;
  ticker: string;
  close: number;
  strategy_signal: "BUY" | "SELL" | "CLOSE";
  account_id?: string;
  quantity?: number;
}

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

export interface RiskManagementRules {
  maxDailyLossPercent: number;
  maxOpenTrades: number;
  positionRiskPercent: number;
}

export interface AccountInfo {
  id: string;
  balance: number;
  equity: number;
  exposure: number;
  openTrades: number;
  dailyPnL: number;
}

export interface RiskCheckResult {
  allowed: boolean;
  reason?: string;
  availableExposure?: number;
  currentExposure?: number;
}

export interface AnalyticsMetrics {
  winRate: number;
  totalTrades: number;
  totalWinningTrades: number;
  totalLosingTrades: number;
  totalProfit: number;
  totalLoss: number;
  profitFactor: number;
  maxDrawdown: number;
  averageWin: number;
  averageLoss: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
