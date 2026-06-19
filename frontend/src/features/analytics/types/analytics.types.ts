export interface IAnalyticsProps {
  accountId: string;
}

export interface IDailyPnL {
  date: string;
  pnl: number;
  trades: number;
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
