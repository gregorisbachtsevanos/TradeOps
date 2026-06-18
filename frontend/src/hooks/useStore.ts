import { create } from "zustand";
import { queryClient } from "../app/lib/queryClient.js";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
  clearUser: () => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (accountId: string | null) => void;
  selectedStrategyId: string | null;
  setSelectedStrategyId: (strategyId: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  clearUser: () => {
    // Clear all React Query cache to prevent data leakage between users
    queryClient.clear();
    // Clear user from store
    set({ user: null });
  },
  selectedAccountId: null,
  setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),
  selectedStrategyId: null,
  setSelectedStrategyId: (strategyId) =>
    set({ selectedStrategyId: strategyId }),
}));
