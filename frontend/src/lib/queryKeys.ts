export const queryKeys = {
  auth: {
    me: ["auth", "me"] as const,
  },
  trades: {
    all: (filters: {
      accountId?: string;
      page?: number;
      limit?: number;
      status?: string;
      symbol?: string;
    }) => ["trades", filters] as const,
    detail: (id: string) => ["trade", id] as const,
    livePrice: (id: string) => ["trade-live-price", id] as const,
  },
  strategies: {
    all: ["strategies"] as const,
    detail: (id: string) => ["strategy", id] as const,
  },
  accounts: {
    all: ["accounts"] as const,
    detail: (id: string) => ["account", id] as const,
    info: (id: string) => ["account-info", id] as const,
  },
  analytics: {
    strategy: (id: string) => ["analytics", "strategy", id] as const,
    account: (id: string) => ["analytics", "account", id] as const,
    pnl: (id: string, days: number) => ["analytics", "pnl", id, days] as const,
    recentTrades: (id: string, limit: number) => [
      "analytics",
      "recent-trades",
      id,
      limit,
    ] as const,
  },
};
