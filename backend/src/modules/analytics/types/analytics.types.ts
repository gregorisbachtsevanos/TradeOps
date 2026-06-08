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
