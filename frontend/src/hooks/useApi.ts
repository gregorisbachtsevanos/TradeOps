import { useQuery, useMutation, useQueryClient } from "react-query";
import {
  accountsApi,
  analyticsApi,
  authApi,
  strategiesApi,
  tradesApi,
} from "../app/api";

// Auth
export const useLogin = () => {
  const queryClient = useQueryClient();
  return useMutation(
    ({ email, password }: { email: string; password: string }) =>
      authApi.login(email, password),
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
    }) => authApi.register(email, password, name),
    {
      onSuccess: () => {
        queryClient.invalidateQueries("user");
      },
    },
  );
};

export const useCurrentUser = () => {
  const hasToken = Boolean(localStorage.getItem("auth_token"));
  return useQuery(["user"], () => authApi.me(), {
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
    () => tradesApi.getTrades(accountId, page, limit, status),
    { enabled: Boolean(accountId), staleTime: 5000 },
  );
};

export const useTrade = (tradeId: string) => {
  return useQuery(["trade", tradeId], () => tradesApi.getTrade(tradeId), {
    staleTime: 10000,
  });
};

export const useTradeLivePrice = (tradeId: string) => {
  return useQuery(
    ["tradeLivePrice", tradeId],
    () => tradesApi.realtimePrice(tradeId),
    {
      refetchInterval: 2000,
    },
  );
};

export const useCloseTrade = () => {
  const queryClient = useQueryClient();
  return useMutation((tradeId: string) => tradesApi.closeTrade(tradeId), {
    onSuccess: () => {
      queryClient.invalidateQueries("trades");
    },
  });
};

// Strategies
export const useStrategies = () => {
  return useQuery(["strategies"], () => strategiesApi.getAll(), {
    staleTime: 30000,
  });
};

export const useStrategy = (strategyId: string) => {
  return useQuery(
    ["strategy", strategyId],
    () => strategiesApi.get(strategyId),
    {
      staleTime: 30000,
    },
  );
};

export const useCreateStrategy = () => {
  const queryClient = useQueryClient();
  return useMutation(
    (data: { name: string; description?: string; riskPercent: number }) =>
      strategiesApi.create(data),
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
      strategiesApi.update(strategyId, data),
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
  return useMutation((strategyId: string) => strategiesApi.remove(strategyId), {
    onSuccess: () => {
      queryClient.invalidateQueries("strategies");
    },
  });
};

// Accounts
export const useAccounts = () => {
  return useQuery(["accounts"], () => accountsApi.getAll(), {
    staleTime: 30000,
  });
};

export const useAccount = (accountId: string) => {
  return useQuery(["account", accountId], () => accountsApi.get(accountId), {
    staleTime: 30000,
  });
};

export const useAccountInfo = (accountId: string) => {
  return useQuery(
    ["accountInfo", accountId],
    () => accountsApi.info(accountId),
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
      accountsApi.create(data),
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
      accountsApi.update(accountId, data),
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
    () => analyticsApi.strategyMetrics(strategyId),
    {
      staleTime: 60000,
    },
  );
};

export const useAccountMetrics = (accountId: string) => {
  return useQuery(
    ["accountMetrics", accountId],
    () => analyticsApi.accountMetrics(accountId),
    {
      enabled: Boolean(accountId),
      staleTime: 60000,
    },
  );
};

export const useRecentTrades = (accountId: string, limit: number = 20) => {
  return useQuery(
    ["recentTrades", accountId, limit],
    () => analyticsApi.recentTrades(accountId, limit),
    {
      enabled: Boolean(accountId),
      staleTime: 10000,
    },
  );
};

export const useDailyPnL = (accountId: string, days: number = 30) => {
  return useQuery(
    ["dailyPnL", accountId, days],
    () => analyticsApi.dailyPnL(accountId, days),
    {
      enabled: Boolean(accountId),
      staleTime: 60000,
    },
  );
};
