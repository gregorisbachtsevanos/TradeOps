export interface IOverviewProps {
  theme: "dark" | "light";
  selectedAccountId: string;
}

export interface IChartWorkspaceProps {
  accountId: string;
  theme: "dark" | "light";
}

export interface ITradingViewChartProps {
  params: URLSearchParams;
}

export interface ITrade {
  id: string;
  symbol: string;
  direction: "BUY" | "SELL";
  entryPrice: number;
  entryTime: string;
  exitPrice?: number;
  exitTime?: string;
  quantity: number;
  status: "OPEN" | "CLOSED" | "REJECTED";
  pnl?: number;
  pnlPercent?: number;
  commission: number;
  strategy?: {
    id: string;
    name: string;
  };
}

export interface IEquityProps {
  accountId: string;
}

export interface IRiskPanelProps {
  accountId: string;
}
