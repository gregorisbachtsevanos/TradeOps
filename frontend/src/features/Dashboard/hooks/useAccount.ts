import { accountsApi } from "@/app/api/index.js";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "../../../app/lib/queryKeys.js";
import { useAppQuery } from "../../../app/lib/reactQuery.js";
import { IAccount } from "../types/dashboard.types.js";

export const useAccounts = () => {
  return useAppQuery({
    queryKey: queryKeys.accounts.all,
    queryFn: () => accountsApi.getAll(),
    select: (response) => response.data!.accounts,
  });
};

export const useAccount = (accountId: string) => {
  return useAppQuery({
    queryKey: queryKeys.accounts.detail(accountId),
    queryFn: () => accountsApi.get(accountId),
    select: (response) => response.data,
  });
};

export const useAccountInfo = (accountId: string) => {
  return useAppQuery({
    queryKey: queryKeys.accounts.info(accountId),
    queryFn: () => accountsApi.info(accountId),
    enabled: Boolean(accountId),
    refetchInterval: 5000,
    select: (response) => response.data,
  });
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      externalId: string;
      balance: number;
      equity: number;
    }) => accountsApi.create(data),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
      return response.data;
    },
  });
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      accountId,
      data,
    }: {
      accountId: string;
      data: Partial<IAccount>;
    }) => accountsApi.update(accountId, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.accounts.detail(variables.accountId),
      });
      queryClient.invalidateQueries({ queryKey: queryKeys.accounts.all });
    },
  });
};
