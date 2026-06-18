export interface IDashboardProps {
  theme: "dark" | "light";
}

export interface IAccountSelectorProps {
  accounts: IAccount[];
  selectedId: string | null;
  onSelect: (accountId: string) => void;
  onCreateDemoAccount?: () => void;
  isCreating?: boolean;
}

export interface IAccount {
  id: string;
  externalId: string;
  balance: number;
  equity: number;
  exposure: number;
  isActive: boolean;
  createdAt: string;
}

export interface IAccountInfo {
  id: string;
  balance: number;
  equity: number;
  exposure: number;
  openTrades: number;
  dailyPnL: number;
}

export type TDashboardTab = "overview" | "trades" | "analytics";

export interface ISidebarProps {
  activeTab: TDashboardTab;
  onTabChange: (tab: TDashboardTab) => void;
}

export interface IKpiStripProps {
  accountId: string | null;
}
