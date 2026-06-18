import { IDailyPnL } from "@/features/StrategyPerformance/types/strategyPerformance.types";
import { ITrade } from "@/features/ChartWorkspace/types/chartWorkspace.types";
import { apiService } from "../api";
import { IAnalyticsMetrics, IApiResponse } from "@/app/types";

export const analyticsApi = {
  strategyMetrics: (strategyId: string) =>
    apiService
      .get<
        IApiResponse<IAnalyticsMetrics>
      >(`/analytics/strategy/${strategyId}/metrics`)
      .then((res) => res.data),

  accountMetrics: (accountId: string) =>
    apiService
      .get<
        IApiResponse<IAnalyticsMetrics>
      >(`/analytics/account/${accountId}/metrics`)
      .then((res) => res.data),

  recentTrades: (accountId: string, limit = 20) =>
    apiService
      .get<
        IApiResponse<{ trades: ITrade[] }>
      >(`/analytics/account/${accountId}/trades`, { params: { limit } })
      .then((res) => res.data),

  dailyPnL: (accountId: string, days = 30) =>
    apiService
      .get<
        IApiResponse<{ dailyPnL: IDailyPnL[] }>
      >(`/analytics/account/${accountId}/daily-pnl`, { params: { days } })
      .then((res) => res.data),
};
