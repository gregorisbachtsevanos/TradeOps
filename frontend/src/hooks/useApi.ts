import { useQuery, useMutation, useQueryClient } from "react-query";
import { apiService } from "../app/services/api.js";

// Auth
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ email, password }: { email: string; password: string }) =>
      apiService.login(email, password),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user");
      },
    },
  );
};

export const useRegister = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({
      email,
      password,
      name,
    }: {
      email: string;
      password: string;
      name: string;
    }) => apiService.register(email, password, name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user");
      },
    },
  );
};

export const useCurrentUser = () => {
  const hasToken = Boolean(localStorage.getItem("auth_token"));
  return useQuery(["user"], () => apiService.getCurrentUser(), {
    staleTime: 60000,
    retry: false,
    enabled: hasToken,
  });
};

// Trades
export const useTrades = (
  accountId: string,
  page: number = 1,
  limit: number = 20,
  status?: string,
) => {
  return useQuery(
    ["trades", accountId, page, limit, status],
    () => apiService.getTrades(accountId, page, limit, status),
    { enabled: Boolean(accountId), staleTime: 5000 },
  );
};

export const useTrade = (tradeId: string) => {
  return useQuery(["trade", tradeId], () => apiService.getTrade(tradeId), {
    staleTime: 10000,
  });
};

export const useTradeLivePrice = (tradeId: string) => {
  return useQuery(
    ["tradeLivePrice", tradeId],
    () => apiService.getTradeLivePrice(tradeId),
    {
      refetchInterval: 2000,
    },
  );
};

export const useCloseTrade = () => {
  const queryClient = useQueryClient();
  return useMutation((tradeId: string) => apiService.closeTrade(tradeId), {
    onSuccess: () => {
      queryClient.invalidateQueries("trades");
    },
  });
};

// Strategies
export const useStrategies = () => {
  return useQuery(["strategies"], () => apiService.getStrategies(), {
    staleTime: 30000,
  });
};

export const useStrategy = (strategyId: string) => {
  return useQuery(
    ["strategy", strategyId],
    () => apiService.getStrategy(strategyId),
    {
      staleTime: 30000,
    },
  );
};

export const useCreateStrategy = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { name: string; description?: string; riskPercent: number }) =>
      apiService.createStrategy(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["strategies"]);
      },
    },
  );
};

export const useUpdateStrategy = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ strategyId, data }: { strategyId: string; data: any }) =>
      apiService.updateStrategy(strategyId, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["strategy", variables.strategyId]);
        queryClient.invalidateQueries("strategies");
      },
    },
  );
};

export const useDeleteStrategy = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (strategyId: string) => apiService.deleteStrategy(strategyId),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("strategies");
      },
    },
  );
};

// Accounts
export const useAccounts = () => {
  return useQuery(["accounts"], () => apiService.getAccounts(), {
    staleTime: 30000,
  });
};

export const useAccount = (accountId: string) => {
  return useQuery(
    ["account", accountId],
    () => apiService.getAccount(accountId),
    {
      staleTime: 30000,
    },
  );
};

export const useAccountInfo = (accountId: string) => {
  return useQuery(
    ["accountInfo", accountId],
    () => apiService.getAccountInfo(accountId),
    {
      enabled: Boolean(accountId),
      refetchInterval: 5000,
    },
  );
};

export const useCreateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { externalId: string; balance: number; equity: number }) =>
      apiService.createAccount(data),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(["accounts"]);
      },
    },
  );
};

export const useUpdateAccount = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ accountId, data }: { accountId: string; data: any }) =>
      apiService.updateAccount(accountId, data),
    {
      onSuccess: (_, variables) => {
        queryClient.invalidateQueries(["account", variables.accountId]);
        queryClient.invalidateQueries("accounts");
      },
    },
  );
};

// Analytics
export const useStrategyMetrics = (strategyId: string) => {
  return useQuery(
    ["strategyMetrics", strategyId],
    () => apiService.getStrategyMetrics(strategyId),
    {
      staleTime: 60000,
    },
  );
};

export const useAccountMetrics = (accountId: string) => {
  return useQuery(
    ["accountMetrics", accountId],
    () => apiService.getAccountMetrics(accountId),
    {
      enabled: Boolean(accountId),
      staleTime: 60000,
    },
  );
};

export const useRecentTrades = (accountId: string, limit: number = 20) => {
  return useQuery(
    ["recentTrades", accountId, limit],
    () => apiService.getRecentTrades(accountId, limit),
    {
      enabled: Boolean(accountId),
      staleTime: 10000,
    },
  );
};

export const useDailyPnL = (accountId: string, days: number = 30) => {
  return useQuery(
    ["dailyPnL", accountId, days],
    () => apiService.getDailyPnL(accountId, days),
    {
      enabled: Boolean(accountId),
      staleTime: 60000,
    },
  );
};
