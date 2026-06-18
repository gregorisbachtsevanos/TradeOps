import { useAppQuery } from "../../app/lib/reactQuery.js";
import { queryKeys } from "../../app/lib/queryKeys.js";
import { tradesApi } from "../../app/api/";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ITrade } from "@/features/ChartWorkspace/types/chartWorkspace.types.js";

export interface TradeFilters {
  accountId?: string;
  page?: number;
  limit?: number;
  status?: string;
  symbol?: string;
}

export interface TradesResult {
  items: ITrade[];
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };
}

export function useTrades(filters: TradeFilters = {}) {
  const { accountId, page = 1, limit = 20, status, symbol } = filters;
  return useAppQuery({
    queryKey: queryKeys.trades.all({ accountId, page, limit, status, symbol }),
    queryFn: () => tradesApi.getTrades(accountId!, page, limit, status, symbol),
    enabled: Boolean(accountId),
    select: (response) => ({
      items: response.data!.data,
      pagination: response.data!.pagination,
    }),
  });
}

export function useTrade(tradeId: string) {
  return useAppQuery({
    queryKey: queryKeys.trades.detail(tradeId),
    queryFn: () => tradesApi.getTrade(tradeId),
    select: (response) => response.data,
  });
}

export function useTradeLivePrice(tradeId: string) {
  return useAppQuery({
    queryKey: queryKeys.trades.livePrice(tradeId),
    queryFn: () => tradesApi.realtimePrice(tradeId),
    enabled: Boolean(tradeId),
    refetchInterval: 2000,
    select: (response) => response.data,
  });
}

export function useCloseTrade() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (tradeId: string) => tradesApi.closeTrade(tradeId),
    onSuccess: (_, tradeId) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.trades.detail(tradeId),
      });
      queryClient.invalidateQueries({
        queryKey: ["trades"],
        exact: false,
      });
    },
  });
}
