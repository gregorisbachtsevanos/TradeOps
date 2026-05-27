import { create } from "zustand";

interface User {
  id: string;
  email: string;
  name: string;
}

interface Store {
  user: User | null;
  setUser: (user: User | null) => void;
  selectedAccountId: string | null;
  setSelectedAccountId: (accountId: string | null) => void;
  selectedStrategyId: string | null;
  setSelectedStrategyId: (strategyId: string | null) => void;
}

export const useStore = create<Store>((set) => ({
  user: null,
  setUser: (user) => set({ user }),
  selectedAccountId: null,
  setSelectedAccountId: (accountId) => set({ selectedAccountId: accountId }),
  selectedStrategyId: null,
  setSelectedStrategyId: (strategyId) =>
    set({ selectedStrategyId: strategyId }),
}));
