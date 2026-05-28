export interface Trade {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  entryTime: string;
  exitPrice?: number;
  exitTime?: string;
  quantity: number;
  status: "OPEN" | "CLOSED" | "REJECTED";
  pnl?: number;
  pnlPercent?: number;
  commission: number;
}

export interface Signal {
  id: string;
  symbol: string;
  action: "BUY" | "SELL" | "CLOSE";
  price: number;
  timestamp: string;
  isDuplicate: boolean;
  processedAt?: string;
}

export interface Strategy {
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

export interface Account {
  id: string;
  externalId: string;
  balance: number;
  equity: number;
  exposure: number;
  isActive: boolean;
  createdAt: string;
}

export interface AccountInfo {
  id: string;
  balance: number;
  equity: number;
  exposure: number;
  openTrades: number;
  dailyPnL: number;
}

export interface AnalyticsMetrics {
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

export interface DailyPnL {
  date: string;
  pnl: number;
  trades: number;
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
