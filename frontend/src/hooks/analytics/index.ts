import { useAppQuery } from "../../app/lib/reactQuery.js";
import { queryKeys } from "../../app/lib/queryKeys.js";
import { analyticsApi } from "../../app/api/";

export function useStrategyMetrics(strategyId: string) {
  return useAppQuery({
    queryKey: queryKeys.analytics.strategy(strategyId),
    queryFn: () => analyticsApi.strategyMetrics(strategyId),
    select: (response) => response.data,
  });
}

export function useAccountMetrics(accountId: string) {
  return useAppQuery({
    queryKey: queryKeys.analytics.account(accountId),
    queryFn: () => analyticsApi.accountMetrics(accountId),
    enabled: Boolean(accountId),
    select: (response) => response.data,
  });
}

export function useRecentTrades(accountId: string, limit: number = 20) {
  return useAppQuery({
    queryKey: queryKeys.analytics.recentTrades(accountId, limit),
    queryFn: () => analyticsApi.recentTrades(accountId, limit),
    enabled: Boolean(accountId),
    select: (response) => response.data!.trades,
  });
}

export function useDailyPnL(accountId: string, days: number = 30) {
  return useAppQuery({
    queryKey: queryKeys.analytics.pnl(accountId, days),
    queryFn: () => analyticsApi.dailyPnL(accountId, days),
    enabled: Boolean(accountId),
    select: (response) => response.data!.dailyPnL,
  });
}
