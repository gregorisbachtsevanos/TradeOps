import { useAppQuery } from "../../lib/reactQuery.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { apiService } from "../../services/api.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Strategy } from "../../types/index.js";

export function useStrategies() {
  return useAppQuery({
    queryKey: queryKeys.strategies.all,
    queryFn: () => apiService.getStrategies(),
    select: (response) => response.data!.strategies,
  });
}

export function useStrategy(strategyId: string) {
  return useAppQuery({
    queryKey: queryKeys.strategies.detail(strategyId),
    queryFn: () => apiService.getStrategy(strategyId),
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
    }) => apiService.createStrategy(data),
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
      data: Partial<Strategy>;
    }) => apiService.updateStrategy(strategyId, data),
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
    mutationFn: (strategyId: string) => apiService.deleteStrategy(strategyId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.strategies.all });
    },
  });
}
