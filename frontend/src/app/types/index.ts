export interface ISignal {
  id: string;
  symbol: string;
  action: "BUY" | "SELL" | "CLOSE";
  price: number;
  timestamp: string;
  isDuplicate: boolean;
  processedAt?: string;
}

export interface IStrategy {
  id: string;
  name: string;
  description?: string;
  riskPercent: number;
  isActive: boolean;
  createdAt: string;
  _count?: {
    trades: number;
    signals: number;
  };
}

export interface IAnalyticsMetrics {
  winRate: number;
  totalTrades: number;
  totalWinningTrades: number;
  totalLosingTrades: number;
  totalProfit: number;
  totalLoss: number;
  profitFactor: number | null;
  maxDrawdown: number;
  averageWin: number;
  averageLoss: number;
}

export interface IApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  timestamp: string;
}

export interface IPaginatedResponse<T> {
  data: T[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}
