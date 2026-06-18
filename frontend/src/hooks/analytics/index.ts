import { useAppQuery } from "../../lib/reactQuery.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { apiService } from "../../services/api.js";

export function useStrategyMetrics(strategyId: string) {
  return useAppQuery({
    queryKey: queryKeys.analytics.strategy(strategyId),
    queryFn: () => apiService.getStrategyMetrics(strategyId),
    select: (response) => response.data,
  });
}

export function useAccountMetrics(accountId: string) {
  return useAppQuery({
    queryKey: queryKeys.analytics.account(accountId),
    queryFn: () => apiService.getAccountMetrics(accountId),
    enabled: Boolean(accountId),
    select: (response) => response.data,
  });
}

export function useRecentTrades(accountId: string, limit: number = 20) {
  return useAppQuery({
    queryKey: queryKeys.analytics.recentTrades(accountId, limit),
    queryFn: () => apiService.getRecentTrades(accountId, limit),
    enabled: Boolean(accountId),
    select: (response) => response.data!.trades,
  });
}

export function useDailyPnL(accountId: string, days: number = 30) {
  return useAppQuery({
    queryKey: queryKeys.analytics.pnl(accountId, days),
    queryFn: () => apiService.getDailyPnL(accountId, days),
    enabled: Boolean(accountId),
    select: (response) => response.data!.dailyPnL,
  });
}
