import { useAppQuery } from "../../../app/lib/reactQuery.js";
import { queryKeys } from "../../../app/lib/queryKeys.js";
import { analyticsApi, strategiesApi } from "../../../app/api/index.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { IStrategy } from "../types/strategies.types.js";

export function useStrategyMetrics(strategyId: string) {
  return useAppQuery({
    queryKey: queryKeys.analytics.strategy(strategyId),
    queryFn: () => analyticsApi.strategyMetrics(strategyId),
    enabled: Boolean(strategyId),
    select: (response) => response.data,
  });
}

export function useStrategies() {
  return useAppQuery({
    queryKey: queryKeys.strategies.all,
    queryFn: () => strategiesApi.getAll(),
    select: (response) => response.data!.strategies,
  });
}

export function useStrategy(strategyId: string) {
  return useAppQuery({
    queryKey: queryKeys.strategies.detail(strategyId),
    queryFn: () => strategiesApi.get(strategyId),
    select: (response) => response.data,
  });
}

export function useCreateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      name: string;
      description?: string;
      riskPercent: number;
    }) => strategiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies.all });
    },
  });
}

export function useUpdateStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      strategyId,
      data,
    }: {
      strategyId: string;
      data: Partial<IStrategy>;
    }) => strategiesApi.update(strategyId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.strategies.detail(variables.strategyId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies.all });
    },
  });
}

export function useDeleteStrategy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (strategyId: string) => strategiesApi.remove(strategyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies.all });
    },
  });
}
