import { pnlRanges } from "../helpers/contants";

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

interface ITradingDayStats {
  date: string;
  pnl: number;
  trades: number;
}

export interface IPnl {
  selectedRange: (typeof pnlRanges)[number];
  pnlStats: {
    total: number;
    positiveDays: number;
    negativeDays: number;
    bestDay: ITradingDayStats;
    worstDay: ITradingDayStats;
    maxPnL: number;
  };
  handleRangeChange: (range: (typeof pnlRanges)[number]) => void;
}

export interface IPnlChart {
  chartData: (IDailyPnL & {
    label: string;
  })[];
  pnlStats: IPnl["pnlStats"];
}
