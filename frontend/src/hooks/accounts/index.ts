import { useAppQuery } from "../../lib/reactQuery.js";
import { queryKeys } from "../../lib/queryKeys.js";
import { apiService } from "../../services/api.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Account } from "../../types/index.js";

export function useAccounts() {
  return useAppQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => apiService.getAccounts(),
    select: (response) => response.data!.accounts,
  });
}

export function useAccount(accountId: string) {
  return useAppQuery({
    queryKey: queryKeys.accounts.detail(accountId),
    queryFn: () => apiService.getAccount(accountId),
    select: (response) => response.data,
  });
}

export function useAccountInfo(accountId: string) {
  return useAppQuery({
    queryKey: queryKeys.accounts.info(accountId),
    queryFn: () => apiService.getAccountInfo(accountId),
    enabled: Boolean(accountId),
    refetchInterval: 5000,
    select: (response) => response.data,
  });
}

export function useCreateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      externalId: string;
      balance: number;
      equity: number;
    }) => apiService.createAccount(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      return response.data;
    },
  });
}

export function useUpdateAccount() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: Partial<Account>;
    }) => apiService.updateAccount(accountId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.detail(variables.accountId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
}
